"use strict";

/**
 * Empty data source used until an API or local database is connected.
 *
 * The UI never owns school records. It asks this object for data, which makes
 * it possible to replace this class with an API-backed implementation later.
 */
class EmptySchoolDataSource {
  async getCurrentTeacher() { return null; }
  async getNextClass() { return null; }
  async getTodaySchedule() { return []; }
  async getWeeklySchedule() { return []; }
  async getClasses() { return []; }
  async getAttendanceSummary() { return null; }
  async getClassRegister() { return null; }
}

/**
 * Stores attendance changes supplied by a real register.
 * There are no pupil records or attendance values embedded in this class.
 */
class AttendanceStore {
  constructor(storage, storageKey) {
    this.storage = storage;
    this.storageKey = storageKey;
    this.records = this.load();
  }

  load() {
    try {
      return JSON.parse(this.storage.getItem(this.storageKey) || "{}");
    } catch {
      return {};
    }
  }

  getStatus(pupilId) {
    return this.records[pupilId]?.status ?? null;
  }

  updateStatus(pupilId, status) {
    this.records[pupilId] = {
      status,
      changedAt: new Date().toISOString(),
      syncState: "pending"
    };
    this.save();
  }

  markAllSynced() {
    Object.values(this.records).forEach((record) => { record.syncState = "synced"; });
    this.save();
  }

  getSummary(pupils) {
    const summary = { present: 0, absent: 0, late: 0, unmarked: 0 };
    pupils.forEach((pupil) => {
      const status = this.getStatus(pupil.id);
      if (status && Object.hasOwn(summary, status)) summary[status] += 1;
      else summary.unmarked += 1;
    });
    return summary;
  }

  save() {
    this.storage.setItem(this.storageKey, JSON.stringify(this.records));
  }
}

/** Controls rendering, navigation and interactions for the browser prototype. */
class TeacherAppPrototype {
  constructor(rootElement, dataSource, attendanceStore) {
    this.root = rootElement;
    this.dataSource = dataSource;
    this.attendanceStore = attendanceStore;
    this.isOnline = true;
    this.activeView = "home";
    this.previousView = "home";
    this.activeRegister = null;
    this.toastTimer = null;
  }

  async initialise() {
    this.bindAuthenticationEvents();
    this.bindNavigationEvents();
    this.bindAttendanceEvents();
    this.bindConnectivityEvents();
    this.updateConnectivityDisplay();
    await this.renderApplicationData();
  }

  find(selector) { return this.root.querySelector(selector); }
  findAll(selector) { return this.root.querySelectorAll(selector); }

  bindAuthenticationEvents() {
    this.find("#password-toggle").addEventListener("click", () => this.togglePasswordVisibility());
    this.find("#login-form").addEventListener("submit", (event) => this.handleLogin(event));
  }

  bindNavigationEvents() {
    this.findAll("[data-view-name]").forEach((button) => {
      button.addEventListener("click", () => this.showView(button.dataset.viewName));
    });
    this.find("#register-back").addEventListener("click", () => this.showView(this.previousView));
    this.find("#application-screen").addEventListener("click", (event) => {
      const registerButton = event.target.closest("[data-class-id]");
      if (registerButton) this.openRegister(registerButton.dataset.classId);
    });
  }

  bindAttendanceEvents() {
    this.find("#pupil-list").addEventListener("click", (event) => this.handleAttendanceSelection(event));
    this.find("#save-draft").addEventListener("click", () => this.saveDraft());
    this.find("#submit-register").addEventListener("click", () => this.submitRegister());
  }

  bindConnectivityEvents() {
    this.find("#network-toggle").addEventListener("click", () => this.toggleConnectivity());
  }

  togglePasswordVisibility() {
    const passwordInput = this.find("#teacher-password");
    const toggleButton = this.find("#password-toggle");
    const shouldShow = passwordInput.type === "password";
    passwordInput.type = shouldShow ? "text" : "password";
    toggleButton.textContent = shouldShow ? "Hide" : "Show";
    toggleButton.setAttribute("aria-label", shouldShow ? "Hide password" : "Show password");
  }

  async handleLogin(event) {
    event.preventDefault();
    this.showScreen("loading-screen");
    await this.renderApplicationData();
    this.showScreen("application-screen");
    this.showView("home");
  }

  showScreen(screenId) {
    this.findAll(".screen").forEach((screen) => {
      screen.classList.toggle("is-active", screen.id === screenId);
    });
  }

  showView(viewName) {
    if (viewName === "more") {
      this.showToast("This section has not been connected yet.");
      return;
    }
    if (viewName === "register") this.previousView = this.activeView === "register" ? "home" : this.activeView;
    this.activeView = viewName;
    this.findAll(".app-view").forEach((view) => { view.hidden = view.id !== `${viewName}-view`; });
    this.find("#bottom-navigation").hidden = viewName === "register";
    this.findAll(".navigation-item").forEach((button) => {
      button.classList.toggle("is-selected", button.dataset.viewName === viewName);
    });
  }

  async renderApplicationData() {
    const [teacher, nextClass, todaySchedule, weeklySchedule, classes, attendance] = await Promise.all([
      this.dataSource.getCurrentTeacher(),
      this.dataSource.getNextClass(),
      this.dataSource.getTodaySchedule(),
      this.dataSource.getWeeklySchedule(),
      this.dataSource.getClasses(),
      this.dataSource.getAttendanceSummary()
    ]);

    this.renderHeader(teacher);
    this.renderNextClass(nextClass);
    this.renderSchedule(this.find("#today-schedule"), todaySchedule, "No classes scheduled for today.");
    this.renderSchedule(this.find("#weekly-schedule"), weeklySchedule, "No timetable has been loaded.");
    this.renderClasses(classes);
    this.renderAttendanceSummary(attendance);
    this.renderDayPicker(weeklySchedule);
  }

  renderHeader(teacher) {
    this.find("#current-date").textContent = new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(new Date());
    this.find("#welcome-heading").textContent = teacher?.firstName ? `Welcome, ${teacher.firstName}` : "Welcome";
    this.findAll(".avatar").forEach((avatar) => { avatar.textContent = teacher?.initials || "T"; });
  }

  renderNextClass(nextClass) {
    const container = this.find("#next-class-container");
    if (!nextClass) {
      container.innerHTML = this.createEmptyState("No upcoming class", "Your next class will appear here when a timetable is available.");
      return;
    }
    container.innerHTML = `<article class="card next-class"><div class="split"><div><small>Next class</small><h2>${nextClass.name}</h2></div><span class="badge">${nextClass.registerStatus}</span></div><p>${nextClass.details}</p><button class="button button-primary button-block" data-class-id="${nextClass.id}" type="button">Take register</button></article>`;
  }

  renderSchedule(container, schedule, emptyMessage) {
    if (!schedule.length) {
      container.innerHTML = this.createEmptyState("Nothing to show", emptyMessage);
      return;
    }
    container.innerHTML = schedule.map((session) => `<div class="schedule-row"><strong>${session.startTime}</strong><span><strong>${session.name}</strong><small>${session.details}</small></span><button class="button" data-class-id="${session.classId}" type="button">Register</button></div>`).join("");
  }

  renderClasses(classes) {
    const container = this.find("#class-list");
    if (!classes.length) {
      container.innerHTML = this.createEmptyState("No classes", "Assigned classes will appear here after data is loaded.");
      return;
    }
    container.innerHTML = classes.map((schoolClass) => `<button class="card class-row" data-class-id="${schoolClass.id}" type="button"><span><strong>${schoolClass.name}</strong><small>${schoolClass.details}</small></span><span aria-hidden="true">&rsaquo;</span></button>`).join("");
  }

  renderAttendanceSummary(attendance) {
    const container = this.find("#attendance-summary");
    if (!attendance) {
      container.innerHTML = this.createEmptyState("No attendance data", "Attendance totals will appear after registers are recorded.");
      this.find("#attendance-updated-at").textContent = "";
      return;
    }
    container.innerHTML = `<div class="statistics"><article class="card"><small>Present</small><strong>${attendance.present}</strong></article><article class="card"><small>Absent</small><strong>${attendance.absent}</strong></article><article class="card"><small>Late</small><strong>${attendance.late}</strong></article></div>`;
    this.find("#attendance-updated-at").textContent = attendance.updatedAt || "";
  }

  renderDayPicker(schedule) {
    const days = [...new Set(schedule.map((session) => session.dayLabel).filter(Boolean))];
    this.find("#day-picker").innerHTML = days.map((day, index) => `<button class="button ${index === 0 ? "button-primary" : ""}" type="button">${day}</button>`).join("");
    this.find("#timetable-period").textContent = "";
  }

  async openRegister(classId) {
    this.activeRegister = await this.dataSource.getClassRegister(classId);
    if (!this.activeRegister) {
      this.showToast("No register is available for this class.");
      return;
    }
    this.find("#register-class-name").textContent = this.activeRegister.name;
    this.find("#register-session-details").textContent = this.activeRegister.details || "";
    this.renderAttendanceRegister();
    this.showView("register");
  }

  renderAttendanceRegister() {
    const pupils = this.activeRegister?.pupils || [];
    if (!pupils.length) {
      this.find("#pupil-list").innerHTML = this.createEmptyState("No pupils", "The class register has no pupil records.");
      this.find("#register-summary").textContent = "No attendance recorded";
      return;
    }
    this.find("#pupil-list").innerHTML = pupils.map((pupil) => this.createPupilRow(pupil)).join("");
    this.updateRegisterSummary();
  }

  createPupilRow(pupil) {
    const selectedStatus = this.attendanceStore.getStatus(pupil.id);
    const options = [
      { value: "present", symbol: "P", label: "Present" },
      { value: "absent", symbol: "A", label: "Absent" },
      { value: "late", symbol: "L", label: "Late" }
    ];
    const buttons = options.map((option) => {
      const isSelected = selectedStatus === option.value;
      return `<button class="button ${isSelected ? "button-primary" : ""}" data-pupil-id="${pupil.id}" data-status="${option.value}" type="button" aria-pressed="${isSelected}" aria-label="Mark ${pupil.name} ${option.label}">${option.symbol}</button>`;
    }).join("");
    return `<article class="card pupil-row"><div class="pupil-name"><strong>${pupil.name}</strong></div><div class="attendance-options" role="group" aria-label="Attendance status for ${pupil.name}">${buttons}</div></article>`;
  }

  handleAttendanceSelection(event) {
    const button = event.target.closest("[data-pupil-id]");
    if (!button || !this.activeRegister) return;
    this.attendanceStore.updateStatus(button.dataset.pupilId, button.dataset.status);
    this.renderAttendanceRegister();
    this.find("#draft-status").textContent = this.isOnline ? "Unsaved" : "Saved offline";
  }

  updateRegisterSummary() {
    const summary = this.attendanceStore.getSummary(this.activeRegister?.pupils || []);
    this.find("#register-summary").textContent = `${summary.present} present | ${summary.absent} absent | ${summary.late} late | ${summary.unmarked} unmarked`;
  }

  saveDraft() {
    if (!this.activeRegister) return;
    this.attendanceStore.save();
    this.find("#draft-status").textContent = this.isOnline ? "Draft saved" : "Saved offline";
    this.showToast(this.isOnline ? "Draft saved." : "Draft saved on this device.");
  }

  submitRegister() {
    if (!this.activeRegister) return;
    if (this.isOnline) this.attendanceStore.markAllSynced();
    this.find("#draft-status").textContent = this.isOnline ? "Submitted" : "Pending sync";
    this.showToast(this.isOnline ? "Register submitted." : "Register queued until a connection is available.");
  }

  toggleConnectivity() {
    this.isOnline = !this.isOnline;
    if (this.isOnline) this.attendanceStore.markAllSynced();
    this.updateConnectivityDisplay();
    this.showToast(this.isOnline ? "Connection restored." : "Offline mode enabled.");
  }

  updateConnectivityDisplay() {
    this.find("#network-status").classList.toggle("is-offline", !this.isOnline);
    this.find("#network-label").textContent = this.isOnline ? "Online" : "Offline";
    this.find("#network-toggle").textContent = this.isOnline ? "Go offline" : "Go online";
  }

  createEmptyState(title, message) {
    return `<article class="card empty-state"><strong>${title}</strong><p>${message}</p></article>`;
  }

  showToast(message) {
    const toast = this.find("#toast");
    window.clearTimeout(this.toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    this.toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
  }
}

const rootElement = document.getElementById("teacher-app");
const dataSource = new EmptySchoolDataSource();
const attendanceStore = new AttendanceStore(window.localStorage, "teacherAttendance");
const application = new TeacherAppPrototype(rootElement, dataSource, attendanceStore);
application.initialise();

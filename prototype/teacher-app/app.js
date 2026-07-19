"use strict";

/**
 * Holds the dummy information used by this prototype.
 *
 * In the real application this information will come from the school API.
 * Keeping it here makes it easy to replace later without changing the UI code.
 */
class PrototypeData {
  static pupils = [
    { id: "pupil-001", name: "Aaliyah Khan" },
    { id: "pupil-002", name: "Adam Patel" },
    { id: "pupil-003", name: "Bilal Ahmed" },
    { id: "pupil-004", name: "Eliza Brown" },
    { id: "pupil-005", name: "Fatima Ali" },
    { id: "pupil-006", name: "Hassan Malik" }
  ];

  static statuses = Object.freeze({ PRESENT: "present", ABSENT: "absent", LATE: "late" });
}

/**
 * Provides one place for reading and writing attendance data.
 *
 * The prototype uses the browser's localStorage so that selections survive a
 * refresh. A React Native app would replace this with an SQLite or AsyncStorage
 * implementation while keeping a similar public interface.
 */
class AttendanceStore {
  /** Creates the store and loads any previously saved attendance records. */
  constructor(storage, storageKey) {
    this.storage = storage;
    this.storageKey = storageKey;
    this.records = this.load();
  }

  /** Reads saved records. Invalid or missing data safely produces an empty object. */
  load() {
    try {
      return JSON.parse(this.storage.getItem(this.storageKey) || "{}");
    } catch {
      return {};
    }
  }

  /** Returns one pupil's status, defaulting to present for a new register. */
  getStatus(pupilId) {
    return this.records[pupilId]?.status || PrototypeData.statuses.PRESENT;
  }

  /** Records a change, its time, and the fact that it has not yet been synced. */
  updateStatus(pupilId, status) {
    this.records[pupilId] = { status, changedAt: new Date().toISOString(), syncState: "pending" };
    this.save();
  }

  /** Simulates a successful upload to the future server. */
  markAllSynced() {
    Object.values(this.records).forEach((record) => { record.syncState = "synced"; });
    this.save();
  }

  /** Counts each attendance status for the summary displayed above the register. */
  getSummary(pupils) {
    const summary = { present: 0, absent: 0, late: 0 };
    pupils.forEach((pupil) => { summary[this.getStatus(pupil.id)] += 1; });
    return summary;
  }

  /** Persists the current record collection in the browser. */
  save() {
    this.storage.setItem(this.storageKey, JSON.stringify(this.records));
  }
}

/**
 * Controls the visible prototype and responds to user actions.
 *
 * This class deliberately does not know how localStorage works. It asks the
 * AttendanceStore to manage data, while it manages screens, buttons and text.
 */
class TeacherAppPrototype {
  constructor(rootElement, attendanceStore) {
    this.root = rootElement;
    this.attendanceStore = attendanceStore;
    this.isOnline = true;
    this.activeView = "home";
    this.previousView = "home";
    this.toastTimer = null;
  }

  /** Connects every event listener and paints the initial application state. */
  initialise() {
    this.bindAuthenticationEvents();
    this.bindNavigationEvents();
    this.bindAttendanceEvents();
    this.bindConnectivityEvents();
    this.updateConnectivityDisplay();
    this.renderAttendanceRegister();
  }

  // These helpers keep DOM queries short and restricted to this application.
  find(selector) { return this.root.querySelector(selector); }
  findAll(selector) { return this.root.querySelectorAll(selector); }

  // Each bind method groups event listeners by feature.
  bindAuthenticationEvents() {
    this.find("#password-toggle").addEventListener("click", () => this.togglePasswordVisibility());
    this.find("#login-form").addEventListener("submit", (event) => this.handleLogin(event));
  }

  bindNavigationEvents() {
    this.findAll("[data-view-name]").forEach((button) => {
      button.addEventListener("click", () => this.showView(button.dataset.viewName));
    });
    this.findAll(".open-register").forEach((button) => {
      button.addEventListener("click", () => this.openRegister(button.dataset.className));
    });
    this.find("#register-back").addEventListener("click", () => this.showView(this.previousView));
  }

  bindAttendanceEvents() {
    this.find("#pupil-list").addEventListener("click", (event) => this.handleAttendanceSelection(event));
    this.find("#save-draft").addEventListener("click", () => this.saveDraft());
    this.find("#submit-register").addEventListener("click", () => this.submitRegister());
  }

  bindConnectivityEvents() {
    this.find("#network-toggle").addEventListener("click", () => this.toggleConnectivity());
  }

  /** Switches the password input between concealed and readable text. */
  togglePasswordVisibility() {
    const passwordInput = this.find("#teacher-password");
    const toggleButton = this.find("#password-toggle");
    const shouldShow = passwordInput.type === "password";
    passwordInput.type = shouldShow ? "text" : "password";
    toggleButton.textContent = shouldShow ? "Hide" : "Show";
    toggleButton.setAttribute("aria-label", shouldShow ? "Hide password" : "Show password");
  }

  /** Simulates authentication and briefly displays the loading screen. */
  handleLogin(event) {
    event.preventDefault();
    this.showScreen("loading-screen");
    window.setTimeout(() => {
      this.showScreen("application-screen");
      this.showView("home");
    }, 900);
  }

  /** Displays one top-level screen: login, loading, or the signed-in application. */
  showScreen(screenId) {
    this.findAll(".screen").forEach((screen) => {
      screen.classList.toggle("is-active", screen.id === screenId);
    });
  }

  /**
   * Displays one signed-in view and updates the bottom navigation.
   * The unfinished More area currently gives the user an explanatory message.
   */
  showView(viewName) {
    if (viewName === "more") {
      this.showToast("Homework, merits and messaging are planned for the next iteration.");
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

  /** Opens the selected class and remembers where the teacher came from. */
  openRegister(className) {
    this.find("#register-class-name").textContent = className;
    this.renderAttendanceRegister();
    this.showView("register");
  }

  /** Rebuilds the visible pupil rows from the latest stored attendance data. */
  renderAttendanceRegister() {
    this.find("#pupil-list").innerHTML = PrototypeData.pupils.map((pupil) => this.createPupilRow(pupil)).join("");
    this.updateRegisterSummary();
  }

  /** Creates the HTML for one pupil and the three attendance choices. */
  createPupilRow(pupil) {
    const status = this.attendanceStore.getStatus(pupil.id);
    const initials = pupil.name.split(" ").map((part) => part[0]).join("");
    const options = [
      { value: "present", symbol: "✓", label: "Present" },
      { value: "absent", symbol: "✕", label: "Absent" },
      { value: "late", symbol: "◷", label: "Late" }
    ];
    const buttons = options.map((option) => {
      const isSelected = status === option.value;
      return `<button class="button ${isSelected ? "button-primary" : ""}" data-pupil-id="${pupil.id}" data-status="${option.value}" type="button" aria-pressed="${isSelected}" aria-label="Mark ${pupil.name} ${option.label}">${option.symbol}</button>`;
    }).join("");
    return `<article class="card pupil-row"><div class="pupil-name"><span class="pupil-initials">${initials}</span><strong>${pupil.name}</strong></div><div class="attendance-options" role="group" aria-label="Attendance status for ${pupil.name}">${buttons}</div></article>`;
  }

  /** Handles clicks from any status button through one delegated listener. */
  handleAttendanceSelection(event) {
    const button = event.target.closest("[data-pupil-id]");
    if (!button) return;
    this.attendanceStore.updateStatus(button.dataset.pupilId, button.dataset.status);
    this.renderAttendanceRegister();
    this.find("#draft-status").textContent = this.isOnline ? "Unsaved" : "Saved offline";
  }

  /** Refreshes the present, absent and late totals. */
  updateRegisterSummary() {
    const summary = this.attendanceStore.getSummary(PrototypeData.pupils);
    this.find("#register-summary").textContent = `${summary.present} present · ${summary.absent} absent · ${summary.late} late`;
  }

  /** Saves progress without treating the register as final. */
  saveDraft() {
    this.attendanceStore.save();
    this.find("#draft-status").textContent = this.isOnline ? "Draft saved" : "Saved offline";
    this.showToast(this.isOnline ? "Draft saved." : "Draft cached on this device.");
  }

  /** Simulates submission now or queues it when the device is offline. */
  submitRegister() {
    if (this.isOnline) this.attendanceStore.markAllSynced();
    this.find("#draft-status").textContent = this.isOnline ? "Submitted" : "Pending sync";
    this.showToast(this.isOnline ? "Register submitted successfully." : "Register queued and will submit when online.");
  }

  /** Simulates losing or restoring the device's internet connection. */
  toggleConnectivity() {
    this.isOnline = !this.isOnline;
    if (this.isOnline) this.attendanceStore.markAllSynced();
    this.updateConnectivityDisplay();
    this.showToast(this.isOnline ? "Connection restored. Pending changes synced." : "Offline mode enabled. Changes will remain on this device.");
  }

  /** Keeps the connectivity message, button and indicator visually consistent. */
  updateConnectivityDisplay() {
    this.find("#network-status").classList.toggle("is-offline", !this.isOnline);
    this.find("#network-label").textContent = this.isOnline ? "Online · All changes synced" : "Offline · Changes will be saved on this device";
    this.find("#network-toggle").textContent = this.isOnline ? "Go offline" : "Go online";
  }

  /** Shows a short message and automatically removes it after 2.2 seconds. */
  showToast(message) {
    const toast = this.find("#toast");
    window.clearTimeout(this.toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    this.toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
  }
}

// Application composition root: create dependencies, then start the app.
const rootElement = document.getElementById("teacher-app");
const attendanceStore = new AttendanceStore(window.localStorage, "teacherPrototypeAttendance");
const application = new TeacherAppPrototype(rootElement, attendanceStore);
application.initialise();

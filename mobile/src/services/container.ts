import { EmptySchoolDataSource } from "@/services/empty-school-data-source";
import type { SchoolDataSource } from "@/services/school-data-source";

/** Application-level dependencies are created in one place for easy replacement. */
export const services: { schoolDataSource: SchoolDataSource } = {
  schoolDataSource: new EmptySchoolDataSource(),
};

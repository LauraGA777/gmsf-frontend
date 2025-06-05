import User from "./user"
import Person from "./person"
import EmergencyContact from "./emergencyContact"
import Membership from "./membership"
import Contract from "./contract"
import ContractHistory from "./contractHistory"
import Training from "./training"

export {
  User,
  Person,
  EmergencyContact,
  Membership,
  Contract,
  ContractHistory,
  Training
}

// Initialize all models and associations
export const initModels = () => {
  // All associations are defined in the model files
  return {
    User,
    Person,
    EmergencyContact,
    Membership,
    Contract,
    ContractHistory,
    Training,
  }
}

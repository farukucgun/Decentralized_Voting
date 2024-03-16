import React, { createContext, useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid"; 

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {

  const [alerts, setAlerts] = useState([]);

  const addAlert = (alert) => {
    setAlerts(prevAlerts => [...prevAlerts, alert]);
  }

  const removeAlert = (alert) => {
    setAlerts(prevAlerts => prevAlerts.filter((prevAlert) => prevAlert.id !== alert.id));
  }

  const setTimedAlert = (msg, type, timeout) => {
    const id = uuidv4();
    const alert = { msg, type, id };
    addAlert(alert);
    setTimeout(() => removeAlert(alert), timeout);
  }


  return (
    <AlertContext.Provider
      value={{ alerts, addAlert, removeAlert, setTimedAlert }}
    >
      {children}
    </AlertContext.Provider>
  );
};

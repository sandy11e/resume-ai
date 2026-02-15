import { createContext, useState } from "react";

export const ResumeContext = createContext();

export const ResumeProvider = ({ children }) => {
  const [analysis, setAnalysis] = useState(null);
  const [jobs, setJobs] = useState([]);

  return (
    <ResumeContext.Provider value={{ analysis, setAnalysis, jobs, setJobs }}>
      {children}
    </ResumeContext.Provider>
  );
};

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import ResultsPage from "./components/ResultsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import History from "./components/History";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <ResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}
// import React from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Home from './pages/Home';
// import ResultsPage from './components/ResultsPage';
// import ProtectedRoute from './components/ProtectedRoute';
// import History from './components/History';

// export default function App() {
//     return (
//         <Router>
//             <Routes>
//                 <Route path="/" element={<Home />} />
//                 <Route
//                     path="/results"
//                     element={
//                         <ProtectedRoute>
//                             <ResultsPage />
//                         </ProtectedRoute>
//                     }
//                 />
//                 <Route
//                     path='/history'
//                     element= {
//                     <ProtectedRoute>
//                         <History/>
//                     </ProtectedRoute> }>
//                 </Route>
//             </Routes>
//         </Router>
//     );
// }

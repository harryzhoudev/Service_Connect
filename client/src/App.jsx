import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/NavigationBar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ServiceForm from './pages/ServiceForm';
import ServiceDetail from './pages/ServiceDetail';
import Services from './pages/Services';
import ServiceBookingConfirm from './pages/ServiceBookingConfirm';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/services/new' element={<ServiceForm />} />
        <Route path='/services/:id' element={<ServiceDetail />} />
        <Route path='/services/:id/edit' element={<ServiceForm />} />
        <Route path='/services' element={<Services />} />
        <Route
          path='/services/:id/booking'
          element={<ServiceBookingConfirm />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { Route, Routes } from 'react-router-dom';
import Messaging from './components/Messaging/Messaging';
import Signup from './components/Authentication/SignupPage';
import Login from './components/Authentication/LoginPage';

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/message' element={<Messaging />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />
      </Routes>
    </div>
  )
}

export default App
import React from 'react';

import ReactDOM from 'react-dom/client';

import {BrowserRouter, Route, Routes} from 'react-router-dom';

import Header from './pages/Header';
import Footer from './pages/Footer';

import Student from './pages/Student/Student';
import Admin from './pages/Admin/Admin';
import ManageMembers from './pages/Admin/ManageMembers';
import AddMember from './pages/Admin/AddMember';
import EditMember from './pages/Admin/EditMember';
import Login from './pages/Login/Login';


function App(){
  return(
      <Routes>
        <Route path='/' element={<div className='min-vh-100 w-100 d-flex flex-column justify-content-between'><Header/><Student /><Footer /></div>} />
        <Route path='/admin' element={<div className='min-vh-100 w-100 d-flex flex-column justify-content-between'><Header/><div className=' d-flex flex-fill flex-column justify-content-start'><Admin /></div><Footer /></div>}/>
        <Route path='/admin/manage-members' element={<div className='min-vh-100 w-100 d-flex flex-column justify-content-between'><Header/><ManageMembers /><Footer /></div>}/>
        <Route path='/admin/add-member' element={<div className='min-vh-100 w-100 d-flex flex-column justify-content-between'><Header/><AddMember /><Footer /></div>}/>
        <Route path='/admin/edit-member/:id' element={<div className='vh-100 w-100 d-flex flex-column justify-content-between'><Header/><EditMember /><Footer /></div>}/>
        <Route path='/login' element={<div className='min-vh-100 w-100 d-flex flex-column justify-content-between'><Header/><Login /><Footer /></div>}/>
        <Route path='*' element={<h1>404 - Not Found</h1>} />
      </Routes>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
        <App/>
    </BrowserRouter>
  </React.StrictMode>
);
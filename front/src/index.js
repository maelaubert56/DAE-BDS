import React from 'react';

import ReactDOM from 'react-dom/client';

import {BrowserRouter, Route, Routes} from 'react-router-dom';

import Header from './pages/Header';

import Student from './pages/Student/Student';
import Admin from './pages/Admin/Admin';
import ManageMembers from './pages/Admin/ManageMembers';
import AddMember from './pages/Admin/AddMember';
import EditMember from './pages/Admin/EditMember';
import Login from './pages/Login/Login';


function App(){
  return(
      <Routes>
        <Route path='/' element={<div className='vh-100'><Header/><Student /></div>} />
        <Route path='/admin' element={<div className='vh-100'><Header/><Admin /></div>}/>
        <Route path='/admin/manage-members' element={<div className='vh-100'><Header/><ManageMembers /></div>}/>
        <Route path='/admin/add-member' element={<div className='vh-100'><Header/><AddMember /></div>}/>
        <Route path='/admin/edit-member/:id' element={<div className='vh-100'><Header/><EditMember /></div>}/>
        <Route path='/login' element={<div className='vh-100'><Login /></div>}/>
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
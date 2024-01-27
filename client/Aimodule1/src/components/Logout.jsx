import { Button } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';





const Logoutbutton = () => {
    const hapticFeedback = React.useCallback(() => {
        if ('vibrate' in navigator) {
          navigator.vibrate(75);
        }
      }, []);
    const navigate = useNavigate();
const logout = async () => {
    hapticFeedback();
if (window.confirm('Are you sure you want to log out?')) {
    // Make a POST request to the `/logout` endpoint
    await axios.get('/auth/logout');
    navigate('/login');
}
  };
    return (
        < Button onClick={logout} variant='contained'  color="error">
        Logout </Button>
    );
}

export { Logoutbutton};
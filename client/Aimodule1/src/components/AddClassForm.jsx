import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, TextField, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import "../styles/AddClassForm.css";
import { useTheme } from '@mui/system';
import toast from 'react-hot-toast';
import { useData } from '../DataContext';
import { AwesomeButton } from 'react-awesome-button';
import 'react-awesome-button/dist/styles.css';
import { TrashIcon, PlusIcon, ZapIcon } from "@primer/octicons-react";
import MutatingDotesSpinner from './Spinners/MutatingDotsSpinner'

function AddClassForm({ isModalOpen, toggleAddClassModal }) {
  const [classNames, setClassNames] = useState(['']);
  const [loading, setLoading] = useState(false);
  const { classOptions, fetchAll } = useData();
  const theme = useTheme();

  const preventDefault = (e) => e.preventDefault();

  const handleClassSubmit = async (e) => {
    e.preventDefault();

    if (classNames.some(className => className.trim() === '')) {
      toast.error('Please fill in all class names.');
      return;
    }

    setLoading(true);
    const isAlreadyPresent = classNames.some(className => classOptions.some(option => option.name === className));

    if (isAlreadyPresent) {
      toast.error('Already Present In DB');
      setLoading(false);
      return;
    }

    const apiUrl = '/class';

    try {
      // setLoading(true);

      const response = await axios.post(apiUrl, { classNames });
      console.log('Classes added successfully', response.data);
      toast.success('Added Successfully');
      setClassNames(['']);
      fetchAll();
      toggleAddClassModal();
        } catch (error) {
      console.error('Error adding classes', error);
      toast.error('Sorry, something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClassField = () => {
    setClassNames([...classNames, '']);
  };

  const handleCancelClassField = (index) => {
    if (classNames.length > 1) {
      const updatedClassNames = [...classNames];
      updatedClassNames.splice(index, 1);
      setClassNames(updatedClassNames);
    } else {
      toast.error('At least one class is required.');
    }
  };

  const handleClassChange = (index, value) => {
    const updatedClassNames = [...classNames];
    updatedClassNames[index] = value;
    setClassNames(updatedClassNames);
  };
  

  return (
    <>
    <Dialog open={isModalOpen} onClose={toggleAddClassModal}  style={{ width: '100' ,margin: '0' }} className="p-0">
      <DialogTitle>
        <Typography variant="h5" component="div" className={`text-center mb-4`}>
          Add Class/es
        </Typography>
      </DialogTitle>
      <DialogContent >
        <Card className={`border-0 shadow add-class-card`} style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <CardContent>
            <form onSubmit={preventDefault}>
              {classNames.map((className, index) => (
                <div key={index} className="mb-3 row">
                  <label htmlFor={`className${index + 1}`} className=" col-form-label">
                    Class Name {index + 1} :
                  </label>
                  <div className=" d-flex align-items-center">
                    <TextField
                      type="text"
                      placeholder={`Class ${index + 1}`}
                      value={className}
                      onChange={(e) => handleClassChange(index, e.target.value)}
                      variant="outlined"
                      className={`w-100 text-center ${theme.palette.mode === 'dark' ? 'border-light' : 'border-dark'} rounded me-1`}
                    />
                    <AwesomeButton
                      type="secondary"
                      onPress={() => handleCancelClassField(index)}
                      disabled={classNames.length === 1}
                      className="aws-btn"
                    >
                      <TrashIcon />
                      Cancel
                    </AwesomeButton>
                  </div>
                </div>
              ))}
              <Grid container justifyContent="flex-end">
                <Grid item className='d-flex align-items-center justify-content-end'>
                  <AwesomeButton type="primary" onPress={handleClassSubmit}   className="aws-btn">
                    <ZapIcon />
                    Add Class(es)
                  </AwesomeButton>
                  <AwesomeButton type="danger" onPress={handleAddClassField} className="ms-1 aws-btn w=100">
                    <PlusIcon size={20} />
                    Multiple
                  </AwesomeButton>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={toggleAddClassModal}>
          Done !
        </Button>
      </DialogActions>
    </Dialog>
{loading && <MutatingDotesSpinner />}    </>
  );
}

export default AddClassForm;

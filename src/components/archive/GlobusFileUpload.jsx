import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { useOAuthContext } from "./globus-auth-context/GlobusOAuthProvider";

const GlobusFileUpload = () => {
  const [file, setFile] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  const manager = useOAuthContext();

  const onDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const authenticateWithGlobus = async () => {
    // Replace with your actual OAuth2 authentication logic to get the access token
    const response = await axios.post('https://auth.globus.org/v2/oauth2/token', {
      client_id: 'YOUR_CLIENT_ID',
      client_secret: 'YOUR_CLIENT_SECRET',
      grant_type: 'client_credentials',
      scope: 'urn:globus:auth:scope:transfer.api.globus.org:all'
    });
    setAccessToken(response.data.access_token);
  };


  const uploadFile = async () => {
    if (!file || accessToken) {
      alert('Please select a file and authenticate first.');
      return;
    }
  
    const endpointId = '278b9bfe-24da-11e9-9fa2-0a06afd4a22e';
    const path = '/home/cushorts';
  
    //const uploadUrl = `https://transfer.api.globusonline.org/v0.10/operation/endpoint/${endpointId}/submit`;
    const uploadUrl = `m-3c735c.233564.36fe.data.globus.org/home/cushorts/Pokemon_Type_Chart.svg.png`;
    
    const formData = new FormData();
    formData.append('file', file, file.name); // Ensure correct file name is included
    formData.append('path', path);

    try {
      const response = await axios.put(uploadUrl, formData, {
        headers: {
          'Authorization': `Bearer ${manager.authorization?.tokens.transfer?.access_token}`,
          'Content-Type': 'multipart/form-data; boundary=' + formData._boundary
        }
      });
      console.log('File uploaded successfully', response.data);
    } catch (error) {
      console.error('Error uploading file', error.response ? error.response.data : error);
    }
  };
  

  /*const uploadFile = async () => {
    if (!file || accessToken) { //if (!file || !accessToken) {
      alert('Please select a file and authenticate first.');
      return;
    }

    const endpointId = '278b9bfe-24da-11e9-9fa2-0a06afd4a22e';
    const path = '/home/cushorts';

    const uploadUrl = `https://transfer.api.globusonline.org/v0.10/operation/endpoint/${endpointId}/submit`;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);
    
    try {
      const response = await axios.post(uploadUrl, formData, {
        headers: {
          'Authorization': `Bearer ${manager.authorization?.tokens.transfer?.access_token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('File uploaded successfully', response.data);
    } catch (error) {
      console.error('Error uploading file', error);
    }
  };*/

  return (
    <div>
      <h2>Upload File to Globus Endpoint</h2>
      <div {...getRootProps()} style={{ border: '2px dashed #0087F7', padding: '20px', cursor: 'pointer' }}>
        <input {...getInputProps()} />
        {file ? <p>{file.name}</p> : <p>Drag 'n' drop a file here, or click to select a file</p>}
      </div>
      <button onClick={authenticateWithGlobus}>Authenticate with Globus</button>
      <button onClick={uploadFile}>Upload File</button>
    </div>
  );
};

export default GlobusFileUpload;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './audits.css';

const Audits = () => {
  const [auditType, setAuditType] = useState('internal');
  const [auditData, setAuditData] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableStatus, setTableStatus] = useState('loading');
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(Date.now()); // Add this line
  const [lastUploadDate, setLastUploadDate] = useState(null);
  const navigate = useNavigate();

   useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getAuditData(auditType);
        // Ensure data is always an array
        setAuditData(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
        setAuditData([]); // Reset to empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [auditType]);

  useEffect(() => {
    const checkUser = async () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        navigate('/');
        return;
      }

      const user = JSON.parse(userStr);
      setIsAdmin(user.role === 'admin');
      await loadAuditData();
    };

    checkUser();
  }, [auditType, navigate]);

  const loadAuditData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAuditData(auditType);
      setAuditData(data);
      setLastUploadDate(data.length > 0 ? data[0].lastUploadDate : null);
    } catch (err) {
      setError('Failed to load audit data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
  const selectedFile = e.target.files[0];
  if (selectedFile) {
    setFile(selectedFile);
  }
};

const handleFileUpload = async () => {
  if (!file) return;

  setIsLoading(true);
  setError('');
  
  try {
    // Create a new FormData instance for each upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', auditType);
    
    // Reset the file input after upload
    setFile(null);
    setFileKey(Date.now()); // This forces the input to reset

    await api.uploadAuditFile(formData, auditType);
    await loadAuditData();
  } catch (err) {
    setError(err.message || 'Failed to upload file');
  } finally {
    setIsLoading(false);
  }
};

  const handleCellUpdate = async (rowIndex, columnName, value) => {
    const updatedData = [...auditData];
    updatedData[rowIndex][columnName] = value;
    setAuditData(updatedData);

    try {
      await api.updateAuditRecord(auditType, updatedData[rowIndex]);
    } catch (err) {
      setError('Failed to save changes');
    }
  };

  return (
    <div className="audits-container">
      <h2>Audit Dashboard</h2>
      
      <div className="audit-type-selector">
        <button 
          className={`audit-type-btn ${auditType === 'internal' ? 'active' : ''}`}
          onClick={() => setAuditType('internal')}
        >
          Internal Audit
        </button>
        <button 
          className={`audit-type-btn ${auditType === 'external' ? 'active' : ''}`}
          onClick={() => setAuditType('external')}
        >
          External Audit
        </button>
      </div>

      

      {isAdmin && (
        <div className="file-upload-section">
          <h3>Upload New Audit File</h3>
          <input type="file" accept=".xlsx" onChange={handleFileChange} key={fileKey} />
          <button 
            onClick={handleFileUpload} 
            disabled={!file || isLoading}
            className="upload-btn"
          >
            {isLoading ? 'Uploading...' : 'Upload'}
          </button>
          {lastUploadDate && (
            <p className="upload-info">
              Last updated: {new Date(lastUploadDate).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
      
      <div className="audit-table-container">
        {isLoading ? (
          <p>Loading audit data...</p>
        ) : (
          <table className="audit-table">
            <thead>
              <tr>
                <th>SN</th>
                <th>Location</th>
                <th>Domain/Clauses</th>
                <th>Date of audit</th>
                <th>Date of submission of report</th>
                <th>NC / MiN/ I *</th>
                <th>Observation description</th>
                <th>Root Cause Analysis</th>
                <th>Corrective Action</th>
                <th>Preventive Action</th>
                <th>Responsibility</th>
                <th>Closing Dates</th>
                <th>Status (Open/Closed)</th>
                <th>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {auditData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td>{row.SN}</td>
                  <td>{row.Location}</td>
                  <td>{row.DomainClauses}</td>
                  <td>{row.DateOfAudit}</td>
                  <td>{row.DateOfSubmission}</td>
                  <td>{row.NCMinI}</td>
                  <td>{row.ObservationDescription}</td>
                  <td>
                    <input
                      type="text"
                      value={row.RootCauseAnalysis || ''}
                      onChange={(e) => handleCellUpdate(rowIndex, 'RootCauseAnalysis', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.CorrectiveAction || ''}
                      onChange={(e) => handleCellUpdate(rowIndex, 'CorrectiveAction', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.PreventiveAction || ''}
                      onChange={(e) => handleCellUpdate(rowIndex, 'PreventiveAction', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.Responsibility || ''}
                      onChange={(e) => handleCellUpdate(rowIndex, 'Responsibility', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={row.ClosingDates || ''}
                      onChange={(e) => handleCellUpdate(rowIndex, 'ClosingDates', e.target.value)}
                    />
                  </td>
                  <td>
                    <select
                      value={row.Status || 'Open'}
                      onChange={(e) => handleCellUpdate(rowIndex, 'Status', e.target.value)}
                    >
                      <option value="Open">Open</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.Evidence || ''}
                      onChange={(e) => handleCellUpdate(rowIndex, 'Evidence', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Audits;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { inspectionsAPI } from '../services/api';
import './InspectionDetailScreen.css';

const InspectionDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllLocations, setShowAllLocations] = useState(false);

  useEffect(() => {
    loadInspection();
  }, [id]);

  const loadInspection = async () => {
    try {
      setIsLoading(true);
      const response = await inspectionsAPI.getInspection(id);
      if (response.success) {
        setInspection(response.data);
      } else {
        console.error('Failed to load inspection:', response.error);
      }
    } catch (error) {
      console.error('Error loading inspection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToEditForm = () => {
    navigate(`/inspection/edit/${id}`, { 
      state: { inspectionData: inspection, isEditMode: true } 
    });
  };

  const buildSectionTitle = (title) => (
    <div className="section-title">
      {title}
    </div>
  );

  const buildInfoCard = (title, children) => (
    <div className="info-card">
      <div className="info-card-header">
        {title}
      </div>
      <div className="info-card-content">
        {children}
      </div>
    </div>
  );

  const buildInfoRow = (label, value, isImportant = false) => (
    <div className="info-row">
      <div className={`info-label ${isImportant ? 'important' : ''}`}>
        {label}:
      </div>
      <div className={`info-value ${isImportant ? 'important' : ''}`}>
        {value || 'N/A'}
      </div>
    </div>
  );

  const buildStatusBadge = (status) => {
    const { color, icon } = getStatusStyle(status);
    return (
      <div className="status-badge" style={{ 
        backgroundColor: `${color}1a`,
        borderColor: color,
        color: color 
      }}>
        <span className={`status-icon ${icon}`}></span>
        <span className="status-text">{status}</span>
      </div>
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved':
        return { color: '#10B981', icon: 'icon-check' };
      case 'Rejected':
        return { color: '#EF4444', icon: 'icon-cancel' };
      case 'Pending':
        return { color: '#F59E0B', icon: 'icon-pending' };
      case 'In Progress':
        return { color: '#3B82F6', icon: 'icon-settings' };
      case 'Completed':
        return { color: '#8B5CF6', icon: 'icon-task' };
      default:
        return { color: '#6B7280', icon: 'icon-assignment' };
    }
  };

  // Location Tracking Section
  const buildLocationSection = () => {
    const locationPoints = inspection?.location_points || [];
    const totalPoints = inspection?.total_location_points || locationPoints.length;
    const startTime = inspection?.location_start_time;
    const endTime = inspection?.location_end_time;

    if (locationPoints.length === 0) {
      return null;
    }

    return (
      <div className="location-section">
        {buildSectionTitle('Location Tracking Data')}
        {buildInfoCard('Location Summary', [
          buildInfoRow('Total Points Captured', totalPoints.toString()),
          buildInfoRow('Tracking Started', formatDateTime(startTime)),
          buildInfoRow('Tracking Ended', formatDateTime(endTime)),
          
          locationPoints.length > 0 && (
            <React.Fragment key="location-points">
              <div className="subsection-title">Location Points:</div>
              {buildLocationPoint('First Location', locationPoints[0])}
              {buildLocationPoint('Last Location', locationPoints[locationPoints.length - 1])}
            </React.Fragment>
          ),
          
          locationPoints.length > 2 && (
            <button
              key="toggle-locations"
              className="toggle-locations-btn"
              onClick={() => setShowAllLocations(!showAllLocations)}
            >
              <span className={`icon ${showAllLocations ? 'icon-visibility-off' : 'icon-visibility'}`}></span>
              {showAllLocations ? 'Hide All Locations' : 'Show All Locations'}
            </button>
          ),
          
          showAllLocations && locationPoints.length > 2 && (
            <React.Fragment key="all-locations">
              <div className="subsection-title">All Location Points:</div>
              {locationPoints.map((point, index) => 
                buildLocationPoint(`Point ${index + 1}`, point)
              )}
            </React.Fragment>
          ),
          
          <div key="map-buttons" className="map-buttons">
            <div className="subsection-title">View on Map:</div>
            <div className="button-group">
              <button className="btn btn-interactive-map" onClick={openInteractiveMap}>
                <span className="icon icon-map"></span>
                Interactive Map
              </button>
              <button className="btn btn-google-maps" onClick={openGoogleMaps}>
                <span className="icon icon-open-new"></span>
                Google Maps
              </button>
            </div>
          </div>
        ])}
      </div>
    );
  };

  const buildLocationPoint = (label, point) => {
    const latitude = point?.latitude?.toFixed(6) || 'N/A';
    const longitude = point?.longitude?.toFixed(6) || 'N/A';
    const timestamp = point?.timestamp || '';
    const accuracy = point?.accuracy?.toFixed(2) || 'N/A';
    const speed = point?.speed?.toFixed(2) || 'N/A';

    return (
      <div key={label} className="location-point">
        <div className="location-point-label">{label}</div>
        <div className="location-point-details">
          {buildCompactInfoRow('Coordinates', `${latitude}, ${longitude}`)}
          {buildCompactInfoRow('Accuracy', `${accuracy} meters`)}
          {speed !== 'N/A' && parseFloat(speed) > 0 && 
            buildCompactInfoRow('Speed', `${speed} m/s`)
          }
          {buildCompactInfoRow('Time', formatDateTime(timestamp))}
        </div>
      </div>
    );
  };

  const buildCompactInfoRow = (label, value) => (
    <div className="compact-info-row">
      <div className="compact-label">{label}:</div>
      <div className="compact-value">{value}</div>
    </div>
  );

  const openInteractiveMap = () => {
    const locationPoints = inspection?.location_points || [];
    if (locationPoints.length === 0) {
      alert('No location data available to show on map');
      return;
    }
    navigate(`/inspection/map/${id}`);
  };

  const openGoogleMaps = () => {
    const locationPoints = inspection?.location_points || [];
    if (locationPoints.length === 0) {
      alert('No location data available to show on map');
      return;
    }

    const firstPoint = locationPoints[0];
    const lat = firstPoint?.latitude;
    const lng = firstPoint?.longitude;
    
    if (!lat || !lng) {
      alert('Invalid location coordinates');
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank');
  };

  // Section K: Checklist
  const buildSectionK = () => {
    const checklistItems = inspection?.checklist_items || {};
    
    if (Object.keys(checklistItems).length === 0) {
      return null;
    }

    return (
      <div className="checklist-section">
        {buildSectionTitle('K. Checklist')}
        {buildInfoCard('Checklist Verification', buildChecklistItems())}
      </div>
    );
  };

  const buildChecklistItems = () => {
    const checklistItems = inspection?.checklist_items || {};
    
    return Object.entries(checklistItems).map(([key, value]) => 
      buildChecklistRow(key, value)
    );
  };

  const buildChecklistRow = (label, value) => {
    let statusText, statusColor, statusIcon;
    
    if (value === true) {
      statusText = 'Yes';
      statusColor = '#10B981';
      statusIcon = 'icon-check-circle';
    } else if (value === false) {
      statusText = 'No';
      statusColor = '#EF4444';
      statusIcon = 'icon-cancel';
    } else {
      statusText = 'N/A';
      statusColor = '#F59E0B';
      statusIcon = 'icon-help';
    }
    
    return (
      <div key={label} className="checklist-row">
        <div className="checklist-label">{label}</div>
        <div 
          className="checklist-status"
          style={{
            backgroundColor: `${statusColor}1a`,
            borderColor: statusColor,
            color: statusColor
          }}
        >
          <span className={`status-icon ${statusIcon}`}></span>
          {statusText}
        </div>
      </div>
    );
  };

  // Section L: Site Photos & Video
  const buildSectionL = () => {
    const sitePhotos = inspection?.site_photos || [];
    const siteVideo = inspection?.site_video || {};
    
    if (sitePhotos.length === 0 && Object.keys(siteVideo).length === 0) {
      return null;
    }

    return (
      <div className="media-section">
        {buildSectionTitle('L. Site Photos & Video Documentation')}
        {buildInfoCard('Media Documentation', [
          sitePhotos.length > 0 && (
            <React.Fragment key="photos">
              {buildInfoRow('Site Photos', `${sitePhotos.length} photos uploaded`)}
              {buildPhotosGrid(sitePhotos)}
            </React.Fragment>
          ),
          
          siteVideo?.base64_data && (
            <React.Fragment key="video">
              {buildInfoRow('Site Video', '1 video uploaded')}
              {buildVideoPreview(siteVideo)}
            </React.Fragment>
          )
        ])}
      </div>
    );
  };

  const buildPhotosGrid = (photos) => (
    <div className="photos-grid-section">
      <div className="subsection-title">Site Photos:</div>
      <div className="photos-grid">
        {photos.map((photo, index) => (
          <div 
            key={index}
            className="photo-thumbnail"
            onClick={() => showPhotoFullScreen(photo, index, photos)}
          >
            {buildPhotoThumbnail(photo, index)}
          </div>
        ))}
      </div>
    </div>
  );

  const buildPhotoThumbnail = (photo, index) => {
    const base64Data = photo?.base64_data;
    
    if (base64Data) {
      return (
        <img
          src={`data:image/jpeg;base64,${base64Data}`}
          alt={`Photo ${index + 1}`}
          className="thumbnail-image"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }
    
    return buildPlaceholderThumbnail(`Photo ${index + 1}`, 'icon-photo');
  };

  const buildVideoPreview = (video) => (
    <div className="video-preview">
      <div className="subsection-title">Site Video:</div>
      <div 
        className="video-thumbnail"
        onClick={() => showVideoFullScreen(video)}
      >
        <div className="video-placeholder">
          <span className="icon icon-videocam"></span>
          <div className="video-info">
            <div className="video-title">{video?.file_name || 'Site Video'}</div>
            {video?.file_size && (
              <div className="video-size">{formatFileSize(video.file_size)}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const buildPlaceholderThumbnail = (title, icon) => (
    <div className="placeholder-thumbnail">
      <span className={`icon ${icon}`}></span>
      <div className="placeholder-title">{title}</div>
    </div>
  );

  const showPhotoFullScreen = (photo, currentIndex, allPhotos) => {
    navigate(`/inspection/photo/${id}`, {
      state: { photos: allPhotos, initialIndex: currentIndex }
    });
  };

  const showVideoFullScreen = (video) => {
    navigate(`/inspection/video/${id}`, { state: { video } });
  };

  // Section M: Documents Upload
  const buildSectionM = () => {
    const documents = inspection?.uploaded_documents || [];
    
    if (documents.length === 0) {
      return null;
    }

    return (
      <div className="documents-section">
        {buildSectionTitle('M. Supporting Documents')}
        {buildInfoCard('Uploaded Documents', [
          buildInfoRow('Total Documents', `${documents.length} documents uploaded`),
          ...documents.map((doc, index) => 
            buildDocumentItem(doc, index)
          )
        ])}
      </div>
    );
  };

  const buildDocumentItem = (doc, index) => {
    const fileName = doc?.name || `Document ${index + 1}`;
    
    return (
      <div key={index} className="document-item">
        <div className="document-icon">
          {getDocumentIcon(fileName)}
        </div>
        <div className="document-info">
          <div className="document-name">{fileName}</div>
          <div className="document-path">
            {doc?.file_path ? 'Tap to view document' : 'No file path available'}
          </div>
        </div>
        <div className="document-actions">
          <button 
            className="btn-icon"
            onClick={() => showDocumentFullScreen(doc, index)}
            title="View Document"
          >
            <span className="icon icon-visibility"></span>
          </button>
          <button 
            className="btn-icon"
            onClick={() => showDocumentInfo(doc, index)}
            title="Document Info"
          >
            <span className="icon icon-info"></span>
          </button>
        </div>
      </div>
    );
  };

  const getDocumentIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <span className="icon icon-pdf"></span>;
      case 'doc':
      case 'docx':
        return <span className="icon icon-document"></span>;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <span className="icon icon-photo"></span>;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <span className="icon icon-videocam"></span>;
      default:
        return <span className="icon icon-file"></span>;
    }
  };

  const showDocumentFullScreen = (doc, index) => {
    navigate(`/inspection/document/${id}`, {
      state: { document: doc, index }
    });
  };

  const showDocumentInfo = (doc, index) => {
    const fileName = doc?.name || `Document ${index + 1}`;
    alert(`Document Info:\nName: ${fileName}\nType: ${getDocumentType(fileName)}\nSize: ${formatFileSize(doc?.file_size)}\nUploaded: ${formatDate(doc?.upload_date)}`);
  };

  const getDocumentType = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'PDF Document';
      case 'doc':
      case 'docx':
        return 'Word Document';
      case 'jpg':
      case 'jpeg':
        return 'JPEG Image';
      case 'png':
        return 'PNG Image';
      case 'mp4':
      case 'avi':
      case 'mov':
        return 'Video File';
      default:
        return 'File';
    }
  };

  // Section I: Working Capital Assessment
  const buildSectionI = () => {
    const workingCapitalItems = inspection?.working_capital_items || [];
    
    if (workingCapitalItems.length === 0) {
      return null;
    }

    return (
      <div className="working-capital-section">
        {buildSectionTitle('I. Working Capital Assessment')}
        {buildInfoCard('Working Capital Items', 
          workingCapitalItems.map((item, index) => 
            buildInfoRow(
              item?.name || 'Item',
              `Unit: ${item?.unit || ''}, Rate: ${item?.rate || ''}, Amount: ${item?.amount || ''}`
            )
          )
        )}
      </div>
    );
  };

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      const bangladeshTime = new Date(date.getTime() + 6 * 60 * 60 * 1000);
      
      const day = bangladeshTime.getDate().toString().padStart(2, '0');
      const month = (bangladeshTime.getMonth() + 1).toString().padStart(2, '0');
      const year = bangladeshTime.getFullYear();
      const hour = bangladeshTime.getHours().toString().padStart(2, '0');
      const minute = bangladeshTime.getMinutes().toString().padStart(2, '0');
      
      return `${day}/${month}/${year} ${hour}:${minute}`;
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateTimeString) => {
    return formatDate(dateTimeString);
  };

  const formatFileSize = (size) => {
    if (!size) return 'Unknown size';
    
    const bytes = typeof size === 'number' ? size : parseInt(size) || 0;
    if (bytes <= 0) return '0 B';
    
    const suffixes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${suffixes[i]}`;
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div>Loading inspection details...</div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <div>Failed to load inspection details</div>
        <button className="btn btn-primary" onClick={loadInspection}>
          Retry
        </button>
      </div>
    );
  }

  const currentStatus = inspection?.status || 'Unknown';

  return (
    <div className="inspection-detail-screen">
      <header className="app-header">
        <div className="header-content">
          <h1 className="header-title">Inspection Details</h1>
        </div>
      </header>

      <main className="main-content">
        {/* Header Card */}
        <div className="header-card">
          <div className="header-card-content">
            <div className="status-section">
              <div className="status-icon-large">
                <span className={getStatusStyle(currentStatus).icon}></span>
              </div>
              <div className="header-info">
                <div className="client-name-section">
                  <span className="client-label">Client Name: </span>
                  <span className="client-name">
                    {inspection?.client_name || 'Unnamed Client'}
                  </span>
                </div>
                <div className="company-section">
                  <span className="company-label">Company: </span>
                  <span className="company-name">
                    {inspection?.company_name || 'No Company'}
                  </span>
                </div>
                <div className="status-section-row">
                  {buildStatusBadge(currentStatus)}
                </div>
                <div className="action-section-row">
                  <button className="btn btn-edit" onClick={navigateToEditForm}>
                    <span className="icon icon-edit"></span>
                    Edit Inspection
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Tracking Section */}
        {buildLocationSection()}

        {/* Section A: Company's Client's Information */}
        {buildSectionTitle("A. Company's Client's Information")}
        {buildInfoCard('Basic Information', [
          buildInfoRow('Client Name', inspection?.client_name, true),
          buildInfoRow('Group Name', inspection?.group_name),
          buildInfoRow('Industry Name', inspection?.industry_name),
          buildInfoRow('Nature of Business', inspection?.nature_of_business),
          buildInfoRow('Legal Status', inspection?.legal_status),
          buildInfoRow('Date of Establishment', inspection?.date_of_establishment),
        ])}

        {buildInfoCard('Address Information', [
          buildInfoRow('Office Address', inspection?.office_address),
          buildInfoRow('Showroom Address', inspection?.showroom_address),
          buildInfoRow('Factory Address', inspection?.factory_address),
        ])}

        {buildInfoCard('Contact & Registration', [
          buildInfoRow('Phone Number', inspection?.phone_number),
          buildInfoRow('Account Number', inspection?.account_number),
          buildInfoRow('Account ID', inspection?.account_id),
          buildInfoRow('TIN Number', inspection?.tin_number),
          buildInfoRow('Date of Opening', inspection?.date_of_opening),
          buildInfoRow('VAT Reg Number', inspection?.vat_reg_number),
          buildInfoRow('First Investment Date', inspection?.first_investment_date),
          buildInfoRow('Sector Code', inspection?.sector_code),
          buildInfoRow('Trade License', inspection?.trade_license),
          buildInfoRow('Economic Purpose Code', inspection?.economic_purpose_code),
          buildInfoRow('Investment Category', inspection?.investment_category),
        ])}

        {/* Continue with other sections... */}
        {buildSectionI()}
        {buildSectionK()}
        {buildSectionL()}
        {buildSectionM()}

        {/* Timestamps */}
        {buildSectionTitle('Additional Information')}
        {buildInfoCard('Timestamps', [
          buildInfoRow('Created At', formatDate(inspection?.created_at)),
          buildInfoRow('Updated At', formatDate(inspection?.updated_at)),
          buildInfoRow('Branch Name', inspection?.branch_name),
          buildInfoRow('Inspector', inspection?.inspector_name || 'N/A'),
          buildInfoRow('Status', inspection?.status || 'N/A'),
        ])}

        <button className="fab" onClick={navigateToEditForm} title="Edit Inspection">
          <span className="icon icon-edit"></span>
        </button>
      </main>
    </div>
  );
};

export default InspectionDetailScreen;
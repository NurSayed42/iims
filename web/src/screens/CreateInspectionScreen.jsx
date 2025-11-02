import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { inspectionsAPI } from '../services/api';
import './CreateInspectionScreen.css';

// Helper Classes
class Partner {
  constructor(data = {}) {
    this.name = data.name || '';
    this.age = data.age || '';
    this.qualification = data.qualification || '';
    this.share = data.share || '';
    this.status = data.status || '';
    this.relationship = data.relationship || '';
  }
}

class Employee {
  constructor(data = {}) {
    this.name = data.name || '';
    this.designation = data.designation || '';
    this.age = data.age || '';
    this.qualification = data.qualification || '';
    this.experience = data.experience || '';
  }
}

class Competitor {
  constructor(data = {}) {
    this.name = data.name || '';
    this.address = data.address || '';
    this.marketShare = data.marketShare || '';
  }
}

class WorkingCapitalItem {
  constructor(name, data = {}) {
    this.name = name;
    this.unit = data.unit || '';
    this.rate = data.rate || '';
    this.amount = data.amount || '';
    this.tiedUpDays = data.tiedUpDays || '';
    this.amountDxe = data.amountDxe || '';
  }
}

class DocumentFile {
  constructor(data = {}) {
    this.name = data.name || '';
    this.path = data.path || '';
    this.uploadDate = data.uploadDate || new Date();
    this.file = data.file || null;
  }
}

const CreateInspectionScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get props from navigation state
  const inspectionData = location.state?.inspectionData;
  const isEditMode = location.state?.isEditMode || false;

  // Location Tracking State
  const [isLocationTracking, setIsLocationTracking] = useState(false);
  const [locationPoints, setLocationPoints] = useState([]);
  const [locationStartTime, setLocationStartTime] = useState(null);
  const [locationEndTime, setLocationEndTime] = useState(null);
  const [locationInterval, setLocationInterval] = useState(null);

  // Section A - Company's Client's Information
  const [sectionA, setSectionA] = useState({
    clientName: '',
    groupName: '',
    industryName: '',
    natureOfBusiness: '',
    legalStatus: '',
    dateOfEstablishment: '',
    officeAddress: '',
    showroomAddress: '',
    factoryAddress: '',
    phone: '',
    accountNo: '',
    accountId: '',
    tin: '',
    dateOfOpening: '',
    vatReg: '',
    firstInvestmentDate: '',
    sectorCode: '',
    tradeLicense: '',
    economicPurpose: '',
    investmentCategory: ''
  });

  // Section B - Owner Information
  const [sectionB, setSectionB] = useState({
    ownerName: '',
    ownerAge: '',
    fatherName: '',
    motherName: '',
    spouseName: '',
    academicQualification: '',
    childrenInfo: '',
    businessSuccessor: '',
    residentialAddress: '',
    permanentAddress: ''
  });

  // Section C - Partners/Directors
  const [partners, setPartners] = useState([new Partner()]);

  // Section D - Purpose
  const [sectionD, setSectionD] = useState({
    purposeInvestment: '',
    purposeBankGuarantee: '',
    periodInvestment: ''
  });

  // Section E - Proposed Facilities
  const [sectionE, setSectionE] = useState({
    facilityType: '',
    existingLimit: '',
    appliedLimit: '',
    recommendedLimit: '',
    bankPercentage: '',
    clientPercentage: ''
  });

  // Section F - Present Outstanding
  const [sectionF, setSectionF] = useState({
    outstandingType: '',
    limit: '',
    netOutstanding: '',
    grossOutstanding: ''
  });

  // Section G - Business Analysis
  const [sectionG, setSectionG] = useState({
    marketSituation: '',
    clientPosition: '',
    businessReputation: '',
    productionType: '',
    productName: '',
    productionCapacity: '',
    actualProduction: '',
    profitabilityObservation: '',
    maleOfficer: '',
    femaleOfficer: '',
    skilledOfficer: '',
    unskilledOfficer: '',
    maleWorker: '',
    femaleWorker: '',
    skilledWorker: '',
    unskilledWorker: ''
  });

  const [competitors, setCompetitors] = useState(Array(5).fill().map(() => new Competitor()));
  const [employees, setEmployees] = useState([new Employee()]);

  // Section H - Property & Assets
  const [sectionH, setSectionH] = useState({
    cashBalance: '',
    stockTradeFinished: '',
    stockTradeFinancial: '',
    accountsReceivable: '',
    advanceDeposit: '',
    otherCurrentAssets: '',
    landBuilding: '',
    plantMachinery: '',
    otherAssets: '',
    ibbl: '',
    otherBanks: '',
    borrowingSources: '',
    accountsPayable: '',
    otherCurrentLiabilities: '',
    longTermLiabilities: '',
    otherNonCurrentLiabilities: '',
    paidUpCapital: '',
    retainedEarning: '',
    resources: ''
  });

  // Auto-calculated values
  const [calculatedValues, setCalculatedValues] = useState({
    currentAssetsSubTotal: 0,
    fixedAssetsSubTotal: 0,
    totalAssets: 0,
    currentLiabilitiesSubTotal: 0,
    totalLiabilities: 0,
    totalEquity: 0,
    grandTotal: 0,
    netWorth: 0
  });

  // Section I - Working Capital Assessment
  const [workingCapitalItems, setWorkingCapitalItems] = useState([
    new WorkingCapitalItem('Raw Materials (imported)'),
    new WorkingCapitalItem('Raw Materials (Local)'),
    new WorkingCapitalItem('Work in Process'),
    new WorkingCapitalItem('Finished goods')
  ]);

  // Section J - Godown Particulars
  const [sectionJ, setSectionJ] = useState({
    godownLocation: '',
    godownCapacity: '',
    godownSpace: '',
    godownNature: '',
    godownOwner: '',
    distanceFromBranch: '',
    itemsToStore: '',
    warehouseLicense: false,
    godownGuard: false,
    dampProof: false,
    easyAccess: false,
    letterDisclaimer: false,
    insurancePolicy: false,
    godownHired: false
  });

  // Section K - Checklist
  const [checklistItems, setChecklistItems] = useState({
    'Business establishment physically verified': null,
    'Honesty and integrity ascertained': null,
    'Confidential Report obtained': null,
    'CIB report obtained': null,
    'Items permissible by Islamic Shariah': null,
    'Items not restricted by Bangladesh Bank': null,
    'Items permissible by Investment Policy': null,
    'Market Price verified': null,
    'Constant market demand': null,
    'F-167 A duly filled': null,
    'F-167 B property filled': null,
    'Application particulars verified': null,
    'IRC, ERC, VAT copies enclosed': null,
    'TIN Certificate enclosed': null,
    'Rental Agreement enclosed': null,
    'Trade License enclosed': null,
    'Partnership Deed enclosed': null,
    'Memorandum & Articles enclosed': null,
    'Board resolution enclosed': null,
    'Directors particulars enclosed': null,
    'Current Account Statement enclosed': null,
    'Creditors/Debtors list enclosed': null,
    'IRC form with documents enclosed': null,
    'Audited Balance sheet enclosed': null,
  });

  // Section L - Site Photos & Video
  const [sitePhotos, setSitePhotos] = useState([]);
  const [siteVideo, setSiteVideo] = useState(null);

  // Section M - Documents Upload
  const [uploadedDocuments, setUploadedDocuments] = useState([]);

  // Status field for edit mode
  const [selectedStatus, setSelectedStatus] = useState('Pending');

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Dropdown options
  const investmentCategories = [
    'Agriculture (AG)',
    'Large & Medium Scale Industry-LM',
    'Working Capital (Jute) WJ',
    'Working Capital (other than Jute) WO',
    'Jute Trading (JT)',
    'Jute & Jute goods Export (JE)',
    'Other Exports (OE)',
    'Other Commercial Investments (OC)',
    'Urban Housing (UH)',
    'Special program',
    'Others (OT)'
  ];

  const facilityTypes = [
    'Bai-Murabaha',
    'Bai-Muajjal',
    'Bai-Salam',
    'Mudaraba',
    'BB LC/ BILLS',
    'FBN/FBP/IBP',
    'Others'
  ];

  const outstandingTypes = [
    'Bai-Murabaha TR',
    'Bai-Muajjal TR',
    'Bai-Salam',
    'BB LC/ BILLS',
    'FBN/FBP/IBP',
    'None',
    'Others'
  ];

  const marketSituations = [
    'Highly Saturated',
    'Saturated',
    'Low Demand Gap',
    'High Demand Gap'
  ];

  const clientPositions = [
    'Market Leader',
    'Medium',
    'Weak',
    'Deteriorating'
  ];

  const reputationOptions = [
    'Very Good',
    'Good',
    'Bad'
  ];

  const productionTypes = [
    'Export Oriented',
    'Import Substitute',
    'Agro Based'
  ];

  const statusOptions = [
    'Pending',
    'In Progress',
    'Completed',
    'Approved',
    'Rejected'
  ];

  // Auto-calculation functions - MOVED BEFORE useEffect
  const calculateAssets = useCallback(() => {
    const currentAssets = parseFloat(sectionH.cashBalance || 0) +
      parseFloat(sectionH.stockTradeFinished || 0) +
      parseFloat(sectionH.stockTradeFinancial || 0) +
      parseFloat(sectionH.accountsReceivable || 0) +
      parseFloat(sectionH.advanceDeposit || 0) +
      parseFloat(sectionH.otherCurrentAssets || 0);

    const fixedAssets = parseFloat(sectionH.landBuilding || 0) +
      parseFloat(sectionH.plantMachinery || 0) +
      parseFloat(sectionH.otherAssets || 0);

    const totalAssets = currentAssets + fixedAssets;

    setCalculatedValues(prev => ({
      ...prev,
      currentAssetsSubTotal: currentAssets,
      fixedAssetsSubTotal: fixedAssets,
      totalAssets: totalAssets
    }));

    calculateNetWorth();
  }, [sectionH]);

  const calculateLiabilities = useCallback(() => {
    const currentLiabilities = parseFloat(sectionH.ibbl || 0) +
      parseFloat(sectionH.otherBanks || 0) +
      parseFloat(sectionH.borrowingSources || 0) +
      parseFloat(sectionH.accountsPayable || 0) +
      parseFloat(sectionH.otherCurrentLiabilities || 0);

    const longTerm = parseFloat(sectionH.longTermLiabilities || 0);
    const otherNonCurrent = parseFloat(sectionH.otherNonCurrentLiabilities || 0);

    const totalLiabilities = currentLiabilities + longTerm + otherNonCurrent;

    setCalculatedValues(prev => ({
      ...prev,
      currentLiabilitiesSubTotal: currentLiabilities,
      totalLiabilities: totalLiabilities
    }));

    calculateNetWorth();
  }, [sectionH]);

  const calculateEquity = useCallback(() => {
    const equity = parseFloat(sectionH.paidUpCapital || 0) +
      parseFloat(sectionH.retainedEarning || 0) +
      parseFloat(sectionH.resources || 0);

    const grandTotal = calculatedValues.totalLiabilities + equity;

    setCalculatedValues(prev => ({
      ...prev,
      totalEquity: equity,
      grandTotal: grandTotal
    }));

    calculateNetWorth();
  }, [sectionH, calculatedValues.totalLiabilities]);

  const calculateNetWorth = useCallback(() => {
    const netWorth = calculatedValues.totalAssets - calculatedValues.totalLiabilities;
    setCalculatedValues(prev => ({
      ...prev,
      netWorth: netWorth
    }));
  }, [calculatedValues.totalAssets, calculatedValues.totalLiabilities]);

  // Initialize form data
  useEffect(() => {
    if (isEditMode && inspectionData) {
      initializeFormData(inspectionData);
    } else if (!isEditMode && inspectionData) {
      // Auto-load data from assigned inspection
      autoLoadFromInspection(inspectionData);
    }
  }, [isEditMode, inspectionData]);

  // Auto-calculation effects - MOVED AFTER function definitions
  useEffect(() => {
    calculateAssets();
  }, [calculateAssets]);

  useEffect(() => {
    calculateLiabilities();
  }, [calculateLiabilities]);

  useEffect(() => {
    calculateEquity();
  }, [calculateEquity]);

  const initializeFormData = (data) => {
    // Section A
    setSectionA({
      clientName: data.client_name || '',
      groupName: data.group_name || '',
      industryName: data.industry_name || '',
      natureOfBusiness: data.nature_of_business || '',
      legalStatus: data.legal_status || '',
      dateOfEstablishment: data.date_of_establishment || '',
      officeAddress: data.office_address || '',
      showroomAddress: data.showroom_address || '',
      factoryAddress: data.factory_address || '',
      phone: data.phone_number || '',
      accountNo: data.account_number || '',
      accountId: data.account_id || '',
      tin: data.tin_number || '',
      dateOfOpening: data.date_of_opening || '',
      vatReg: data.vat_reg_number || '',
      firstInvestmentDate: data.first_investment_date || '',
      sectorCode: data.sector_code || '',
      tradeLicense: data.trade_license || '',
      economicPurpose: data.economic_purpose_code || '',
      investmentCategory: data.investment_category || ''
    });

    // Section B
    setSectionB({
      ownerName: data.owner_name || '',
      ownerAge: data.owner_age || '',
      fatherName: data.father_name || '',
      motherName: data.mother_name || '',
      spouseName: data.spouse_name || '',
      academicQualification: data.academic_qualification || '',
      childrenInfo: data.children_info || '',
      businessSuccessor: data.business_successor || '',
      residentialAddress: data.residential_address || '',
      permanentAddress: data.permanent_address || ''
    });

    // Section D
    setSectionD({
      purposeInvestment: data.purpose_investment || '',
      purposeBankGuarantee: data.purpose_bank_guarantee || '',
      periodInvestment: data.period_investment || ''
    });

    // Section E
    setSectionE({
      facilityType: data.facility_type || '',
      existingLimit: data.existing_limit || '',
      appliedLimit: data.applied_limit || '',
      recommendedLimit: data.recommended_limit || '',
      bankPercentage: data.bank_percentage || '',
      clientPercentage: data.client_percentage || ''
    });

    // Section F
    setSectionF({
      outstandingType: data.outstanding_type || '',
      limit: data.limit_amount || '',
      netOutstanding: data.net_outstanding || '',
      grossOutstanding: data.gross_outstanding || ''
    });

    // Section G
    setSectionG({
      marketSituation: data.market_situation || '',
      clientPosition: data.client_position || '',
      businessReputation: data.business_reputation || '',
      productionType: data.production_type || '',
      productName: data.product_name || '',
      productionCapacity: data.production_capacity || '',
      actualProduction: data.actual_production || '',
      profitabilityObservation: data.profitability_observation || '',
      maleOfficer: data.male_officer || '',
      femaleOfficer: data.female_officer || '',
      skilledOfficer: data.skilled_officer || '',
      unskilledOfficer: data.unskilled_officer || '',
      maleWorker: data.male_worker || '',
      femaleWorker: data.female_worker || '',
      skilledWorker: data.skilled_worker || '',
      unskilledWorker: data.unskilled_worker || ''
    });

    // Section H
    setSectionH({
      cashBalance: data.cash_balance || '',
      stockTradeFinished: data.stock_trade_finished || '',
      stockTradeFinancial: data.stock_trade_financial || '',
      accountsReceivable: data.accounts_receivable || '',
      advanceDeposit: data.advance_deposit || '',
      otherCurrentAssets: data.other_current_assets || '',
      landBuilding: data.land_building || '',
      plantMachinery: data.plant_machinery || '',
      otherAssets: data.other_assets || '',
      ibbl: data.ibbl_investment || '',
      otherBanks: data.other_banks_investment || '',
      borrowingSources: data.borrowing_sources || '',
      accountsPayable: data.accounts_payable || '',
      otherCurrentLiabilities: data.other_current_liabilities || '',
      longTermLiabilities: data.long_term_liabilities || '',
      otherNonCurrentLiabilities: data.other_non_current_liabilities || '',
      paidUpCapital: data.paid_up_capital || '',
      retainedEarning: data.retained_earning || '',
      resources: data.resources || ''
    });

    // Section J
    setSectionJ({
      godownLocation: data.godown_location || '',
      godownCapacity: data.godown_capacity || '',
      godownSpace: data.godown_space || '',
      godownNature: data.godown_nature || '',
      godownOwner: data.godown_owner || '',
      distanceFromBranch: data.distance_from_branch || '',
      itemsToStore: data.items_to_store || '',
      warehouseLicense: data.warehouse_license || false,
      godownGuard: data.godown_guard || false,
      dampProof: data.damp_proof || false,
      easyAccess: data.easy_access || false,
      letterDisclaimer: data.letter_disclaimer || false,
      insurancePolicy: data.insurance_policy || false,
      godownHired: data.godown_hired || false
    });

    // Status
    setSelectedStatus(data.status || 'Pending');

    // Dynamic arrays
    if (data.partners_directors) {
      setPartners(data.partners_directors.map(p => new Partner(p)));
    }
    if (data.key_employees) {
      setEmployees(data.key_employees.map(e => new Employee(e)));
    }
    if (data.competitors) {
      setCompetitors(data.competitors.map((c, i) => new Competitor({...c, id: i})));
    }
    if (data.working_capital_items) {
      setWorkingCapitalItems(data.working_capital_items.map(item => 
        new WorkingCapitalItem(item.name, item)
      ));
    }
    if (data.checklist_items) {
      setChecklistItems(data.checklist_items);
    }
    if (data.location_points) {
      setLocationPoints(data.location_points);
    }
  };

  const autoLoadFromInspection = (data) => {
    setSectionA(prev => ({
      ...prev,
      clientName: data.client_name || '',
      industryName: data.industry_name || '',
      phone: data.phone_number || ''
    }));
  };

  // Location Tracking Functions
  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsLocationTracking(true);
    setLocationStartTime(new Date());
    setLocationPoints([]);

    // Get initial location
    getCurrentLocation();

    // Set up periodic location tracking (every 5 minutes)
    const intervalId = setInterval(getCurrentLocation, 5 * 60 * 1000);
    setLocationInterval(intervalId);
  };

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationPoint = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          speed: position.coords.speed,
          heading: position.coords.heading,
          timestamp: new Date().toISOString()
        };

        setLocationPoints(prev => [...prev, locationPoint]);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert(`Error getting location: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  };

  const stopLocationTracking = () => {
    setIsLocationTracking(false);
    setLocationEndTime(new Date());
    if (locationInterval) {
      clearInterval(locationInterval);
      setLocationInterval(null);
    }
    alert(`Location tracking stopped. ${locationPoints.length} points captured.`);
  };

  // Working capital calculations
  const calculateWorkingCapitalItem = (index) => {
    const item = workingCapitalItems[index];
    const unit = parseFloat(item.unit || 0);
    const rate = parseFloat(item.rate || 0);
    const tiedUpDays = parseFloat(item.tiedUpDays || 0);

    const amount = unit * rate;
    const amountDxe = amount * tiedUpDays;

    const updatedItems = [...workingCapitalItems];
    updatedItems[index] = {
      ...item,
      amount: amount.toFixed(2),
      amountDxe: amountDxe.toFixed(2)
    };

    setWorkingCapitalItems(updatedItems);
  };

  // Form submission
  const submitForm = async () => {
    setIsLoading(true);

    try {
      const branchName = localStorage.getItem('branch_name');
      
      if (!branchName) {
        alert('Branch information not found. Please login again.');
        setIsLoading(false);
        return;
      }

      const inspectionData = {
        branch_name: branchName,
        
        // Location Data
        location_points: locationPoints,
        location_start_time: locationStartTime?.toISOString(),
        location_end_time: locationEndTime?.toISOString(),
        total_location_points: locationPoints.length,
        
        // Section A
        ...sectionA,
        
        // Section B
        ...sectionB,
        
        // Section C
        partners_directors: partners,
        
        // Section D
        ...sectionD,
        
        // Section E
        ...sectionE,
        
        // Section F
        ...sectionF,
        
        // Section G
        ...sectionG,
        competitors: competitors,
        key_employees: employees,
        
        // Section H
        ...sectionH,
        ...calculatedValues,
        
        // Section I
        working_capital_items: workingCapitalItems,
        
        // Section J
        ...sectionJ,
        
        // Section K
        checklist_items: checklistItems,
        
        // Section L
        site_photos: sitePhotos,
        site_video: siteVideo,
        
        // Section M
        uploaded_documents: uploadedDocuments,
        
        // Status
        status: selectedStatus,
        
        // Timestamp
        submitted_at: new Date().toISOString(),
      };

      let success;
      if (isEditMode) {
        success = await inspectionsAPI.updateInspection(inspectionData.id, inspectionData);
      } else {
        success = await inspectionsAPI.createInspection(inspectionData);
      }

      if (success) {
        alert(isEditMode ? 'Inspection updated successfully! ✅' : 'Inspection submitted successfully! ✅');
        navigate(-1);
      } else {
        alert(isEditMode ? 'Failed to update inspection.' : 'Failed to submit inspection.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('An error occurred while submitting the form.');
    } finally {
      setIsLoading(false);
    }
  };

  // File handling functions
  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    if (sitePhotos.length + files.length > 10) {
      alert('Maximum 10 photos allowed');
      return;
    }
    setSitePhotos(prev => [...prev, ...files]);
  };

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSiteVideo(file);
    }
  };

  const handleDocumentUpload = (event) => {
    const files = Array.from(event.target.files);
    const newDocuments = files.map(file => new DocumentFile({
      name: file.name,
      file: file
    }));
    setUploadedDocuments(prev => [...prev, ...newDocuments]);
  };

  const removePhoto = (index) => {
    setSitePhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setSiteVideo(null);
  };

  const removeDocument = (index) => {
    setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  // Dynamic list management
  const addPartner = () => {
    setPartners(prev => [...prev, new Partner()]);
  };

  const removePartner = (index) => {
    setPartners(prev => prev.filter((_, i) => i !== index));
  };

  const updatePartner = (index, field, value) => {
    const updatedPartners = [...partners];
    updatedPartners[index] = { ...updatedPartners[index], [field]: value };
    setPartners(updatedPartners);
  };

  const addEmployee = () => {
    setEmployees(prev => [...prev, new Employee()]);
  };

  const removeEmployee = (index) => {
    setEmployees(prev => prev.filter((_, i) => i !== index));
  };

  const updateEmployee = (index, field, value) => {
    const updatedEmployees = [...employees];
    updatedEmployees[index] = { ...updatedEmployees[index], [field]: value };
    setEmployees(updatedEmployees);
  };

  const updateCompetitor = (index, field, value) => {
    const updatedCompetitors = [...competitors];
    updatedCompetitors[index] = { ...updatedCompetitors[index], [field]: value };
    setCompetitors(updatedCompetitors);
  };

  const updateWorkingCapitalItem = (index, field, value) => {
    const updatedItems = [...workingCapitalItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setWorkingCapitalItems(updatedItems);
    
    if (['unit', 'rate', 'tiedUpDays'].includes(field)) {
      calculateWorkingCapitalItem(index);
    }
  };

  // UI Components
  const SectionContainer = ({ title, children, className = '' }) => (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6 ${className}`}>
      <h2 className="text-xl font-bold text-green-900 mb-4 pb-2 border-b border-gray-200">
        {title}
      </h2>
      {children}
    </div>
  );

  const FormField = ({ label, name, value, onChange, type = 'text', required = false, className = '' }) => (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
    </div>
  );

  const TextAreaField = ({ label, name, value, onChange, required = false, rows = 3 }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
    </div>
  );

  const SelectField = ({ label, name, value, onChange, options, required = false }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
      >
        <option value="">Select {label}</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );

  const RadioGroup = ({ label, name, value, onChange, options }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="space-y-2">
        {options.map(option => (
          <label key={option} className="flex items-center">
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={onChange}
              className="mr-2 text-green-600 focus:ring-green-500"
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );

  const CheckboxField = ({ label, name, checked, onChange }) => (
    <div className="flex items-center mb-2">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="mr-2 text-green-600 focus:ring-green-500 rounded"
      />
      <label className="text-sm text-gray-700">{label}</label>
    </div>
  );

  // Section Builders (keep all the section builder functions as they were in the previous complete code)
  const buildLocationTrackingSection = () => (
    <SectionContainer title="📍 Location Tracking">
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <p className="text-sm text-gray-600 mb-4">
          Automatically capture location every 5 minutes while filling the form
        </p>
        
        <div className={`p-4 rounded-lg border ${
          isLocationTracking ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-200'
        }`}>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              isLocationTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`}></div>
            <div className="flex-1">
              <p className={`font-semibold ${
                isLocationTracking ? 'text-green-700' : 'text-gray-700'
              }`}>
                {isLocationTracking ? 'Location Tracking Active' : 'Location Tracking Inactive'}
              </p>
              <p className="text-sm text-gray-600">
                {isLocationTracking 
                  ? `${locationPoints.length} points captured • Started: ${locationStartTime?.toLocaleTimeString()}`
                  : 'Click "Start Location" to begin tracking'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <button
            type="button"
            onClick={startLocationTracking}
            disabled={isLocationTracking}
            className={`flex-1 py-2 px-4 rounded-md font-medium ${
              isLocationTracking
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            Start Location
          </button>
          <button
            type="button"
            onClick={stopLocationTracking}
            disabled={!isLocationTracking}
            className={`flex-1 py-2 px-4 rounded-md font-medium ${
              !isLocationTracking
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            Stop Location
          </button>
        </div>

        {locationPoints.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-blue-800">Total Points:</span>
              <span className="font-bold text-blue-800">{locationPoints.length}</span>
            </div>
            {locationStartTime && (
              <p className="text-sm text-blue-700">Started: {locationStartTime.toLocaleString()}</p>
            )}
            {locationEndTime && (
              <p className="text-sm text-blue-700">Ended: {locationEndTime.toLocaleString()}</p>
            )}
            {locationPoints.length > 0 && (
              <p className="text-sm text-blue-700 font-mono mt-2">
                Latest: {locationPoints[locationPoints.length - 1].latitude?.toFixed(4)}, {locationPoints[locationPoints.length - 1].longitude?.toFixed(4)}
              </p>
            )}
          </div>
        )}
      </div>
    </SectionContainer>
  );

  const buildSectionA = () => (
    <SectionContainer title="A. Company's Client's Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Name of the Client"
          name="clientName"
          value={sectionA.clientName}
          onChange={(e) => setSectionA(prev => ({...prev, clientName: e.target.value}))}
          required
        />
        <FormField
          label="Group Name (if any)"
          name="groupName"
          value={sectionA.groupName}
          onChange={(e) => setSectionA(prev => ({...prev, groupName: e.target.value}))}
        />
        <FormField
          label="Industry Name (as per CIB)"
          name="industryName"
          value={sectionA.industryName}
          onChange={(e) => setSectionA(prev => ({...prev, industryName: e.target.value}))}
          required
        />
        <FormField
          label="Nature of Business"
          name="natureOfBusiness"
          value={sectionA.natureOfBusiness}
          onChange={(e) => setSectionA(prev => ({...prev, natureOfBusiness: e.target.value}))}
          required
        />
        <FormField
          label="Legal Status"
          name="legalStatus"
          value={sectionA.legalStatus}
          onChange={(e) => setSectionA(prev => ({...prev, legalStatus: e.target.value}))}
          required
        />
        <FormField
          label="Date of Establishment"
          name="dateOfEstablishment"
          type="date"
          value={sectionA.dateOfEstablishment}
          onChange={(e) => setSectionA(prev => ({...prev, dateOfEstablishment: e.target.value}))}
          required
        />
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Address Information</h3>
        <div className="grid grid-cols-1 gap-4">
          <TextAreaField
            label="Office Address"
            name="officeAddress"
            value={sectionA.officeAddress}
            onChange={(e) => setSectionA(prev => ({...prev, officeAddress: e.target.value}))}
            required
          />
          <TextAreaField
            label="Showroom Address"
            name="showroomAddress"
            value={sectionA.showroomAddress}
            onChange={(e) => setSectionA(prev => ({...prev, showroomAddress: e.target.value}))}
          />
          <TextAreaField
            label="Factory / Godown / Depot Address"
            name="factoryAddress"
            value={sectionA.factoryAddress}
            onChange={(e) => setSectionA(prev => ({...prev, factoryAddress: e.target.value}))}
          />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact & Registration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Phone / Mobile no (office)"
            name="phone"
            value={sectionA.phone}
            onChange={(e) => setSectionA(prev => ({...prev, phone: e.target.value}))}
            required
          />
          <FormField
            label="Current A/C no"
            name="accountNo"
            value={sectionA.accountNo}
            onChange={(e) => setSectionA(prev => ({...prev, accountNo: e.target.value}))}
            required
          />
          <FormField
            label="A/C ID no"
            name="accountId"
            value={sectionA.accountId}
            onChange={(e) => setSectionA(prev => ({...prev, accountId: e.target.value}))}
            required
          />
          <FormField
            label="TIN"
            name="tin"
            value={sectionA.tin}
            onChange={(e) => setSectionA(prev => ({...prev, tin: e.target.value}))}
            required
          />
          <FormField
            label="Date of Opening"
            name="dateOfOpening"
            type="date"
            value={sectionA.dateOfOpening}
            onChange={(e) => setSectionA(prev => ({...prev, dateOfOpening: e.target.value}))}
          />
          <FormField
            label="VAT Reg: no"
            name="vatReg"
            value={sectionA.vatReg}
            onChange={(e) => setSectionA(prev => ({...prev, vatReg: e.target.value}))}
          />
          <FormField
            label="Date of 1st Investment availed"
            name="firstInvestmentDate"
            type="date"
            value={sectionA.firstInvestmentDate}
            onChange={(e) => setSectionA(prev => ({...prev, firstInvestmentDate: e.target.value}))}
          />
          <FormField
            label="Sector Code"
            name="sectorCode"
            value={sectionA.sectorCode}
            onChange={(e) => setSectionA(prev => ({...prev, sectorCode: e.target.value}))}
          />
          <FormField
            label="Trade License No & Date"
            name="tradeLicense"
            value={sectionA.tradeLicense}
            onChange={(e) => setSectionA(prev => ({...prev, tradeLicense: e.target.value}))}
            required
          />
          <FormField
            label="Economic Purpose Code"
            name="economicPurpose"
            value={sectionA.economicPurpose}
            onChange={(e) => setSectionA(prev => ({...prev, economicPurpose: e.target.value}))}
          />
        </div>
      </div>

      <div className="mt-6">
        <SelectField
          label="Investment Category"
          name="investmentCategory"
          value={sectionA.investmentCategory}
          onChange={(e) => setSectionA(prev => ({...prev, investmentCategory: e.target.value}))}
          options={investmentCategories}
          required
        />
      </div>
    </SectionContainer>
  );

  const buildSectionB = () => (
    <SectionContainer title="B. Owner Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Name of the Owner (S) & status"
          name="ownerName"
          value={sectionB.ownerName}
          onChange={(e) => setSectionB(prev => ({...prev, ownerName: e.target.value}))}
          required
        />
        <FormField
          label="Age"
          name="ownerAge"
          value={sectionB.ownerAge}
          onChange={(e) => setSectionB(prev => ({...prev, ownerAge: e.target.value}))}
        />
        <FormField
          label="Father's Name"
          name="fatherName"
          value={sectionB.fatherName}
          onChange={(e) => setSectionB(prev => ({...prev, fatherName: e.target.value}))}
        />
        <FormField
          label="Mother's Name"
          name="motherName"
          value={sectionB.motherName}
          onChange={(e) => setSectionB(prev => ({...prev, motherName: e.target.value}))}
        />
        <FormField
          label="Spouse's Name"
          name="spouseName"
          value={sectionB.spouseName}
          onChange={(e) => setSectionB(prev => ({...prev, spouseName: e.target.value}))}
        />
        <FormField
          label="Academic Qualification"
          name="academicQualification"
          value={sectionB.academicQualification}
          onChange={(e) => setSectionB(prev => ({...prev, academicQualification: e.target.value}))}
        />
        <FormField
          label="No. of Children with age"
          name="childrenInfo"
          value={sectionB.childrenInfo}
          onChange={(e) => setSectionB(prev => ({...prev, childrenInfo: e.target.value}))}
        />
        <TextAreaField
          label="Business Successor: (Name relations Age & qualification)"
          name="businessSuccessor"
          value={sectionB.businessSuccessor}
          onChange={(e) => setSectionB(prev => ({...prev, businessSuccessor: e.target.value}))}
        />
        <TextAreaField
          label="Residential Address"
          name="residentialAddress"
          value={sectionB.residentialAddress}
          onChange={(e) => setSectionB(prev => ({...prev, residentialAddress: e.target.value}))}
          required
        />
        <TextAreaField
          label="Permanent Address"
          name="permanentAddress"
          value={sectionB.permanentAddress}
          onChange={(e) => setSectionB(prev => ({...prev, permanentAddress: e.target.value}))}
          required
        />
      </div>
    </SectionContainer>
  );

  const buildSectionC = () => (
    <SectionContainer title="C. List of Partners / Directors">
      {partners.map((partner, index) => (
        <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-800">Partner/Director {index + 1}</h4>
            {partners.length > 1 && (
              <button
                type="button"
                onClick={() => removePartner(index)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Remove
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Name with Father's / husband's"
              name="name"
              value={partner.name}
              onChange={(e) => updatePartner(index, 'name', e.target.value)}
            />
            <FormField
              label="Age"
              name="age"
              value={partner.age}
              onChange={(e) => updatePartner(index, 'age', e.target.value)}
            />
            <FormField
              label="Academic Qualification"
              name="qualification"
              value={partner.qualification}
              onChange={(e) => updatePartner(index, 'qualification', e.target.value)}
            />
            <FormField
              label="Extent of Share (%)"
              name="share"
              value={partner.share}
              onChange={(e) => updatePartner(index, 'share', e.target.value)}
            />
            <FormField
              label="Status"
              name="status"
              value={partner.status}
              onChange={(e) => updatePartner(index, 'status', e.target.value)}
            />
            <FormField
              label="Relationship with Chairman / MD name"
              name="relationship"
              value={partner.relationship}
              onChange={(e) => updatePartner(index, 'relationship', e.target.value)}
            />
          </div>
        </div>
      ))}
      
      <button
        type="button"
        onClick={addPartner}
        className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
      >
        + Add Another Partner/Director
      </button>
    </SectionContainer>
  );

  const buildSectionD = () => (
    <SectionContainer title="D. Purpose">
      <div className="grid grid-cols-1 gap-4">
        <TextAreaField
          label="Purpose of Investment"
          name="purposeInvestment"
          value={sectionD.purposeInvestment}
          onChange={(e) => setSectionD(prev => ({...prev, purposeInvestment: e.target.value}))}
          required
          rows={4}
        />
        <TextAreaField
          label="Purpose of Bank Guarantee"
          name="purposeBankGuarantee"
          value={sectionD.purposeBankGuarantee}
          onChange={(e) => setSectionD(prev => ({...prev, purposeBankGuarantee: e.target.value}))}
          rows={4}
        />
        <FormField
          label="Period of Investment"
          name="periodInvestment"
          value={sectionD.periodInvestment}
          onChange={(e) => setSectionD(prev => ({...prev, periodInvestment: e.target.value}))}
          required
        />
      </div>
    </SectionContainer>
  );

  const buildSectionE = () => (
    <SectionContainer title="E. Proposed Facilities">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label="Type of Facility"
          name="facilityType"
          value={sectionE.facilityType}
          onChange={(e) => setSectionE(prev => ({...prev, facilityType: e.target.value}))}
          options={facilityTypes}
          required
        />
        <FormField
          label="Existing Limit"
          name="existingLimit"
          value={sectionE.existingLimit}
          onChange={(e) => setSectionE(prev => ({...prev, existingLimit: e.target.value}))}
        />
        <FormField
          label="Applied Limit"
          name="appliedLimit"
          value={sectionE.appliedLimit}
          onChange={(e) => setSectionE(prev => ({...prev, appliedLimit: e.target.value}))}
          required
        />
        <FormField
          label="Recommended Limit"
          name="recommendedLimit"
          value={sectionE.recommendedLimit}
          onChange={(e) => setSectionE(prev => ({...prev, recommendedLimit: e.target.value}))}
          required
        />
        <FormField
          label="Bank's Percentage (%)"
          name="bankPercentage"
          value={sectionE.bankPercentage}
          onChange={(e) => setSectionE(prev => ({...prev, bankPercentage: e.target.value}))}
          type="number"
        />
        <FormField
          label="Client's Percentage (%)"
          name="clientPercentage"
          value={sectionE.clientPercentage}
          onChange={(e) => setSectionE(prev => ({...prev, clientPercentage: e.target.value}))}
          type="number"
        />
      </div>
    </SectionContainer>
  );

  const buildSectionF = () => (
    <SectionContainer title="F. Present Outstanding">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label="Type of Outstanding"
          name="outstandingType"
          value={sectionF.outstandingType}
          onChange={(e) => setSectionF(prev => ({...prev, outstandingType: e.target.value}))}
          options={outstandingTypes}
        />
        <FormField
          label="Limit"
          name="limit"
          value={sectionF.limit}
          onChange={(e) => setSectionF(prev => ({...prev, limit: e.target.value}))}
        />
        <FormField
          label="Net Outstanding"
          name="netOutstanding"
          value={sectionF.netOutstanding}
          onChange={(e) => setSectionF(prev => ({...prev, netOutstanding: e.target.value}))}
        />
        <FormField
          label="Gross Outstanding"
          name="grossOutstanding"
          value={sectionF.grossOutstanding}
          onChange={(e) => setSectionF(prev => ({...prev, grossOutstanding: e.target.value}))}
        />
      </div>
    </SectionContainer>
  );

  const buildSectionG = () => (
    <SectionContainer title="G. Business Analysis">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label="Market Situation"
          name="marketSituation"
          value={sectionG.marketSituation}
          onChange={(e) => setSectionG(prev => ({...prev, marketSituation: e.target.value}))}
          options={marketSituations}
        />
        <SelectField
          label="Client's Position in Market"
          name="clientPosition"
          value={sectionG.clientPosition}
          onChange={(e) => setSectionG(prev => ({...prev, clientPosition: e.target.value}))}
          options={clientPositions}
        />
        <SelectField
          label="Business Reputation"
          name="businessReputation"
          value={sectionG.businessReputation}
          onChange={(e) => setSectionG(prev => ({...prev, businessReputation: e.target.value}))}
          options={reputationOptions}
        />
        <SelectField
          label="Type of Production"
          name="productionType"
          value={sectionG.productionType}
          onChange={(e) => setSectionG(prev => ({...prev, productionType: e.target.value}))}
          options={productionTypes}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Product Name"
          name="productName"
          value={sectionG.productName}
          onChange={(e) => setSectionG(prev => ({...prev, productName: e.target.value}))}
        />
        <FormField
          label="Production Capacity"
          name="productionCapacity"
          value={sectionG.productionCapacity}
          onChange={(e) => setSectionG(prev => ({...prev, productionCapacity: e.target.value}))}
        />
        <FormField
          label="Actual Production"
          name="actualProduction"
          value={sectionG.actualProduction}
          onChange={(e) => setSectionG(prev => ({...prev, actualProduction: e.target.value}))}
        />
      </div>

      <TextAreaField
        label="Profitability Observation"
        name="profitabilityObservation"
        value={sectionG.profitabilityObservation}
        onChange={(e) => setSectionG(prev => ({...prev, profitabilityObservation: e.target.value}))}
        rows={4}
      />

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Manpower Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FormField
            label="Male Officer"
            name="maleOfficer"
            value={sectionG.maleOfficer}
            onChange={(e) => setSectionG(prev => ({...prev, maleOfficer: e.target.value}))}
            type="number"
          />
          <FormField
            label="Female Officer"
            name="femaleOfficer"
            value={sectionG.femaleOfficer}
            onChange={(e) => setSectionG(prev => ({...prev, femaleOfficer: e.target.value}))}
            type="number"
          />
          <FormField
            label="Skilled Officer"
            name="skilledOfficer"
            value={sectionG.skilledOfficer}
            onChange={(e) => setSectionG(prev => ({...prev, skilledOfficer: e.target.value}))}
            type="number"
          />
          <FormField
            label="Unskilled Officer"
            name="unskilledOfficer"
            value={sectionG.unskilledOfficer}
            onChange={(e) => setSectionG(prev => ({...prev, unskilledOfficer: e.target.value}))}
            type="number"
          />
          <FormField
            label="Male Worker"
            name="maleWorker"
            value={sectionG.maleWorker}
            onChange={(e) => setSectionG(prev => ({...prev, maleWorker: e.target.value}))}
            type="number"
          />
          <FormField
            label="Female Worker"
            name="femaleWorker"
            value={sectionG.femaleWorker}
            onChange={(e) => setSectionG(prev => ({...prev, femaleWorker: e.target.value}))}
            type="number"
          />
          <FormField
            label="Skilled Worker"
            name="skilledWorker"
            value={sectionG.skilledWorker}
            onChange={(e) => setSectionG(prev => ({...prev, skilledWorker: e.target.value}))}
            type="number"
          />
          <FormField
            label="Unskilled Worker"
            name="unskilledWorker"
            value={sectionG.unskilledWorker}
            onChange={(e) => setSectionG(prev => ({...prev, unskilledWorker: e.target.value}))}
            type="number"
          />
        </div>
      </div>

      {/* Competitors Section */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Competitors Information</h3>
        {competitors.map((competitor, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Competitor {index + 1}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Name"
                name="name"
                value={competitor.name}
                onChange={(e) => updateCompetitor(index, 'name', e.target.value)}
              />
              <FormField
                label="Address"
                name="address"
                value={competitor.address}
                onChange={(e) => updateCompetitor(index, 'address', e.target.value)}
              />
              <FormField
                label="Market Share (%)"
                name="marketShare"
                value={competitor.marketShare}
                onChange={(e) => updateCompetitor(index, 'marketShare', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Key Employees Section */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Employees</h3>
        {employees.map((employee, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-gray-800">Employee {index + 1}</h4>
              {employees.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEmployee(index)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Name"
                name="name"
                value={employee.name}
                onChange={(e) => updateEmployee(index, 'name', e.target.value)}
              />
              <FormField
                label="Designation"
                name="designation"
                value={employee.designation}
                onChange={(e) => updateEmployee(index, 'designation', e.target.value)}
              />
              <FormField
                label="Age"
                name="age"
                value={employee.age}
                onChange={(e) => updateEmployee(index, 'age', e.target.value)}
              />
              <FormField
                label="Qualification"
                name="qualification"
                value={employee.qualification}
                onChange={(e) => updateEmployee(index, 'qualification', e.target.value)}
              />
              <FormField
                label="Experience (Years)"
                name="experience"
                value={employee.experience}
                onChange={(e) => updateEmployee(index, 'experience', e.target.value)}
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addEmployee}
          className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
        >
          + Add Another Employee
        </button>
      </div>
    </SectionContainer>
  );

  const buildSectionH = () => (
    <SectionContainer title="H. Property & Assets (Balance Sheet)">
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">Assets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Cash Balance"
            name="cashBalance"
            value={sectionH.cashBalance}
            onChange={(e) => setSectionH(prev => ({...prev, cashBalance: e.target.value}))}
            type="number"
          />
          <FormField
            label="Stock in Trade (Finished Goods)"
            name="stockTradeFinished"
            value={sectionH.stockTradeFinished}
            onChange={(e) => setSectionH(prev => ({...prev, stockTradeFinished: e.target.value}))}
            type="number"
          />
          <FormField
            label="Stock in Trade (Financial)"
            name="stockTradeFinancial"
            value={sectionH.stockTradeFinancial}
            onChange={(e) => setSectionH(prev => ({...prev, stockTradeFinancial: e.target.value}))}
            type="number"
          />
          <FormField
            label="Accounts Receivable"
            name="accountsReceivable"
            value={sectionH.accountsReceivable}
            onChange={(e) => setSectionH(prev => ({...prev, accountsReceivable: e.target.value}))}
            type="number"
          />
          <FormField
            label="Advance, Deposit & Prepayment"
            name="advanceDeposit"
            value={sectionH.advanceDeposit}
            onChange={(e) => setSectionH(prev => ({...prev, advanceDeposit: e.target.value}))}
            type="number"
          />
          <FormField
            label="Other Current Assets"
            name="otherCurrentAssets"
            value={sectionH.otherCurrentAssets}
            onChange={(e) => setSectionH(prev => ({...prev, otherCurrentAssets: e.target.value}))}
            type="number"
          />
          
          {/* Fixed Assets */}
          <FormField
            label="Land & Building"
            name="landBuilding"
            value={sectionH.landBuilding}
            onChange={(e) => setSectionH(prev => ({...prev, landBuilding: e.target.value}))}
            type="number"
          />
          <FormField
            label="Plant & Machinery"
            name="plantMachinery"
            value={sectionH.plantMachinery}
            onChange={(e) => setSectionH(prev => ({...prev, plantMachinery: e.target.value}))}
            type="number"
          />
          <FormField
            label="Other Assets"
            name="otherAssets"
            value={sectionH.otherAssets}
            onChange={(e) => setSectionH(prev => ({...prev, otherAssets: e.target.value}))}
            type="number"
          />
        </div>

        {/* Auto-calculated Values */}
        <div className="mt-4 p-4 bg-white rounded border">
          <h4 className="font-semibold text-gray-800 mb-2">Calculated Values</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Current Assets:</span>
              <div className="text-green-600 font-bold">${calculatedValues.currentAssetsSubTotal.toFixed(2)}</div>
            </div>
            <div>
              <span className="font-medium">Fixed Assets:</span>
              <div className="text-green-600 font-bold">${calculatedValues.fixedAssetsSubTotal.toFixed(2)}</div>
            </div>
            <div>
              <span className="font-medium">Total Assets:</span>
              <div className="text-green-600 font-bold">${calculatedValues.totalAssets.toFixed(2)}</div>
            </div>
            <div>
              <span className="font-medium">Net Worth:</span>
              <div className="text-green-600 font-bold">${calculatedValues.netWorth.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-red-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-3">Liabilities & Equity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="IBBL Investment"
            name="ibbl"
            value={sectionH.ibbl}
            onChange={(e) => setSectionH(prev => ({...prev, ibbl: e.target.value}))}
            type="number"
          />
          <FormField
            label="Other Banks Investment"
            name="otherBanks"
            value={sectionH.otherBanks}
            onChange={(e) => setSectionH(prev => ({...prev, otherBanks: e.target.value}))}
            type="number"
          />
          <FormField
            label="Borrowing from Other Sources"
            name="borrowingSources"
            value={sectionH.borrowingSources}
            onChange={(e) => setSectionH(prev => ({...prev, borrowingSources: e.target.value}))}
            type="number"
          />
          <FormField
            label="Accounts Payable"
            name="accountsPayable"
            value={sectionH.accountsPayable}
            onChange={(e) => setSectionH(prev => ({...prev, accountsPayable: e.target.value}))}
            type="number"
          />
          <FormField
            label="Other Current Liabilities"
            name="otherCurrentLiabilities"
            value={sectionH.otherCurrentLiabilities}
            onChange={(e) => setSectionH(prev => ({...prev, otherCurrentLiabilities: e.target.value}))}
            type="number"
          />
          <FormField
            label="Long Term Liabilities"
            name="longTermLiabilities"
            value={sectionH.longTermLiabilities}
            onChange={(e) => setSectionH(prev => ({...prev, longTermLiabilities: e.target.value}))}
            type="number"
          />
          <FormField
            label="Other Non-Current Liabilities"
            name="otherNonCurrentLiabilities"
            value={sectionH.otherNonCurrentLiabilities}
            onChange={(e) => setSectionH(prev => ({...prev, otherNonCurrentLiabilities: e.target.value}))}
            type="number"
          />
          
          {/* Equity */}
          <FormField
            label="Paid Up Capital"
            name="paidUpCapital"
            value={sectionH.paidUpCapital}
            onChange={(e) => setSectionH(prev => ({...prev, paidUpCapital: e.target.value}))}
            type="number"
          />
          <FormField
            label="Retained Earning"
            name="retainedEarning"
            value={sectionH.retainedEarning}
            onChange={(e) => setSectionH(prev => ({...prev, retainedEarning: e.target.value}))}
            type="number"
          />
          <FormField
            label="Other Resources"
            name="resources"
            value={sectionH.resources}
            onChange={(e) => setSectionH(prev => ({...prev, resources: e.target.value}))}
            type="number"
          />
        </div>

        {/* Auto-calculated Values for Liabilities */}
        <div className="mt-4 p-4 bg-white rounded border">
          <h4 className="font-semibold text-gray-800 mb-2">Calculated Values</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Current Liabilities:</span>
              <div className="text-red-600 font-bold">${calculatedValues.currentLiabilitiesSubTotal.toFixed(2)}</div>
            </div>
            <div>
              <span className="font-medium">Total Liabilities:</span>
              <div className="text-red-600 font-bold">${calculatedValues.totalLiabilities.toFixed(2)}</div>
            </div>
            <div>
              <span className="font-medium">Total Equity:</span>
              <div className="text-green-600 font-bold">${calculatedValues.totalEquity.toFixed(2)}</div>
            </div>
            <div>
              <span className="font-medium">Grand Total:</span>
              <div className="text-blue-600 font-bold">${calculatedValues.grandTotal.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );

  const buildSectionI = () => (
    <SectionContainer title="I. Working Capital Assessment">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 border border-gray-200 text-left text-sm font-semibold text-gray-700">Items</th>
              <th className="px-4 py-3 border border-gray-200 text-left text-sm font-semibold text-gray-700">Unit</th>
              <th className="px-4 py-3 border border-gray-200 text-left text-sm font-semibold text-gray-700">Rate</th>
              <th className="px-4 py-3 border border-gray-200 text-left text-sm font-semibold text-gray-700">Amount</th>
              <th className="px-4 py-3 border border-gray-200 text-left text-sm font-semibold text-gray-700">Tied Up Days</th>
              <th className="px-4 py-3 border border-gray-200 text-left text-sm font-semibold text-gray-700">Amount DXE</th>
            </tr>
          </thead>
          <tbody>
            {workingCapitalItems.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 border border-gray-200 text-sm font-medium text-gray-900">
                  {item.name}
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <input
                    type="number"
                    value={item.unit}
                    onChange={(e) => updateWorkingCapitalItem(index, 'unit', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="0"
                  />
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => updateWorkingCapitalItem(index, 'rate', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="0.00"
                  />
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <input
                    type="number"
                    value={item.amount}
                    readOnly
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                    placeholder="0.00"
                  />
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <input
                    type="number"
                    value={item.tiedUpDays}
                    onChange={(e) => updateWorkingCapitalItem(index, 'tiedUpDays', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="0"
                  />
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <input
                    type="number"
                    value={item.amountDxe}
                    readOnly
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                    placeholder="0.00"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Note:</strong> Amount = Unit × Rate | Amount DXE = Amount × Tied Up Days</p>
      </div>
    </SectionContainer>
  );

  const buildSectionJ = () => (
    <SectionContainer title="J. Godown Particulars">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Godown Location"
          name="godownLocation"
          value={sectionJ.godownLocation}
          onChange={(e) => setSectionJ(prev => ({...prev, godownLocation: e.target.value}))}
        />
        <FormField
          label="Godown Capacity"
          name="godownCapacity"
          value={sectionJ.godownCapacity}
          onChange={(e) => setSectionJ(prev => ({...prev, godownCapacity: e.target.value}))}
        />
        <FormField
          label="Godown Space (Sq. Ft.)"
          name="godownSpace"
          value={sectionJ.godownSpace}
          onChange={(e) => setSectionJ(prev => ({...prev, godownSpace: e.target.value}))}
        />
        <FormField
          label="Nature of Godown"
          name="godownNature"
          value={sectionJ.godownNature}
          onChange={(e) => setSectionJ(prev => ({...prev, godownNature: e.target.value}))}
        />
        <FormField
          label="Godown Owner"
          name="godownOwner"
          value={sectionJ.godownOwner}
          onChange={(e) => setSectionJ(prev => ({...prev, godownOwner: e.target.value}))}
        />
        <FormField
          label="Distance from Branch (KM)"
          name="distanceFromBranch"
          value={sectionJ.distanceFromBranch}
          onChange={(e) => setSectionJ(prev => ({...prev, distanceFromBranch: e.target.value}))}
        />
      </div>

      <TextAreaField
        label="Items to be Stored"
        name="itemsToStore"
        value={sectionJ.itemsToStore}
        onChange={(e) => setSectionJ(prev => ({...prev, itemsToStore: e.target.value}))}
        rows={3}
      />

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Godown Facilities & Verification</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CheckboxField
            label="Warehouse License"
            name="warehouseLicense"
            checked={sectionJ.warehouseLicense}
            onChange={(e) => setSectionJ(prev => ({...prev, warehouseLicense: e.target.checked}))}
          />
          <CheckboxField
            label="Godown Guard"
            name="godownGuard"
            checked={sectionJ.godownGuard}
            onChange={(e) => setSectionJ(prev => ({...prev, godownGuard: e.target.checked}))}
          />
          <CheckboxField
            label="Damp Proof"
            name="dampProof"
            checked={sectionJ.dampProof}
            onChange={(e) => setSectionJ(prev => ({...prev, dampProof: e.target.checked}))}
          />
          <CheckboxField
            label="Easy Access"
            name="easyAccess"
            checked={sectionJ.easyAccess}
            onChange={(e) => setSectionJ(prev => ({...prev, easyAccess: e.target.checked}))}
          />
          <CheckboxField
            label="Letter of Disclaimer"
            name="letterDisclaimer"
            checked={sectionJ.letterDisclaimer}
            onChange={(e) => setSectionJ(prev => ({...prev, letterDisclaimer: e.target.checked}))}
          />
          <CheckboxField
            label="Insurance Policy"
            name="insurancePolicy"
            checked={sectionJ.insurancePolicy}
            onChange={(e) => setSectionJ(prev => ({...prev, insurancePolicy: e.target.checked}))}
          />
          <CheckboxField
            label="Godown Hired"
            name="godownHired"
            checked={sectionJ.godownHired}
            onChange={(e) => setSectionJ(prev => ({...prev, godownHired: e.target.checked}))}
          />
        </div>
      </div>
    </SectionContainer>
  );

  const buildSectionK = () => (
    <SectionContainer title="K. Checklist">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(checklistItems).map(([item, value]) => (
          <div key={item} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <span className="text-sm text-gray-700">{item}</span>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setChecklistItems(prev => ({...prev, [item]: true}))}
                className={`px-3 py-1 rounded text-xs font-medium ${
                  value === true 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setChecklistItems(prev => ({...prev, [item]: false}))}
                className={`px-3 py-1 rounded text-xs font-medium ${
                  value === false 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                No
              </button>
              <button
                type="button"
                onClick={() => setChecklistItems(prev => ({...prev, [item]: null}))}
                className={`px-3 py-1 rounded text-xs font-medium ${
                  value === null 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                N/A
              </button>
            </div>
          </div>
        ))}
      </div>
    </SectionContainer>
  );

  const buildSectionL = () => (
    <SectionContainer title="L. Site Photos & Video">
      {/* Photos Upload */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Site Photos (Max 10)</h3>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
              </svg>
              <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload photos</span></p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 10MB each)</p>
            </div>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handlePhotoUpload}
              className="hidden" 
            />
          </label>
        </div>
        
        {/* Display Uploaded Photos */}
        {sitePhotos.length > 0 && (
          <div className="mt-4">
            <h4 className="text-md font-semibold text-gray-700 mb-2">Uploaded Photos ({sitePhotos.length}/10)</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {sitePhotos.map((photo, index) => (
                <div key={index} className="relative">
                  <img 
                    src={URL.createObjectURL(photo)} 
                    alt={`Site photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Video Upload */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Site Video</h3>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
              </svg>
              <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload video</span></p>
              <p className="text-xs text-gray-500">MP4, MOV (MAX. 100MB)</p>
            </div>
            <input 
              type="file" 
              accept="video/*" 
              onChange={handleVideoUpload}
              className="hidden" 
            />
          </label>
        </div>
        
        {/* Display Uploaded Video */}
        {siteVideo && (
          <div className="mt-4">
            <h4 className="text-md font-semibold text-gray-700 mb-2">Uploaded Video</h4>
            <div className="relative">
              <video 
                src={URL.createObjectURL(siteVideo)} 
                controls
                className="w-full max-w-md rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={removeVideo}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </SectionContainer>
  );

  const buildSectionM = () => (
    <SectionContainer title="M. Documents Upload">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload documents</span></p>
            <p className="text-xs text-gray-500">PDF, DOC, DOCX (MAX. 10MB each)</p>
          </div>
          <input 
            type="file" 
            multiple 
            accept=".pdf,.doc,.docx" 
            onChange={handleDocumentUpload}
            className="hidden" 
          />
        </label>
      </div>
      
      {/* Display Uploaded Documents */}
      {uploadedDocuments.length > 0 && (
        <div className="mt-4">
          <h4 className="text-md font-semibold text-gray-700 mb-2">Uploaded Documents ({uploadedDocuments.length})</h4>
          <div className="space-y-2">
            {uploadedDocuments.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-500 mr-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 18a.969.969 0 0 0 .933 1h12.134A.969.969 0 0 0 15 18M1 7V5.828a2 2 0 0 1 .586-1.414l2.828-2.828A2 2 0 0 1 5.828 1h8.239A.97.97 0 0 1 15 2v5M6 1v4a1 1 0 0 1-1 1H1m0 9v-5h1.5a1.5 1.5 0 1 1 0 3H1m12 2v-5h2m-2 3h2m-8-3v5h1.375A1.626 1.626 0 0 0 10 13.375v-1.75A1.626 1.626 0 0 0 8.375 10H7Z"/>
                  </svg>
                  <span className="text-sm text-gray-700">{doc.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeDocument(index)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionContainer>
  );

  const buildStatusSection = () => (
    <SectionContainer title="Status">
      <div className="max-w-md">
        <SelectField
          label="Inspection Status"
          name="status"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          options={statusOptions}
          required
        />
      </div>
    </SectionContainer>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Inspection' : 'Create New Inspection'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditMode 
              ? 'Update the inspection details below'
              : 'Fill out all the required information for the new inspection'
            }
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); submitForm(); }}>
          {/* Location Tracking Section */}
          {buildLocationTrackingSection()}

          {/* Section A */}
          {buildSectionA()}

          {/* Section B */}
          {buildSectionB()}

          {/* Section C */}
          {buildSectionC()}

          {/* Section D */}
          {buildSectionD()}

          {/* Section E */}
          {buildSectionE()}

          {/* Section F */}
          {buildSectionF()}

          {/* Section G */}
          {buildSectionG()}

          {/* Section H */}
          {buildSectionH()}

          {/* Section I */}
          {buildSectionI()}

          {/* Section J */}
          {buildSectionJ()}

          {/* Section K */}
          {buildSectionK()}

          {/* Section L */}
          {buildSectionL()}

          {/* Section M */}
          {buildSectionM()}

          {/* Status Section */}
          {buildStatusSection()}

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
            <div className="flex justify-center space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-3 rounded-md font-medium ${
                  isLoading
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEditMode ? 'Updating...' : 'Submitting...'}
                  </div>
                ) : (
                  isEditMode ? 'Update Inspection' : 'Submit Complete Form'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInspectionScreen;
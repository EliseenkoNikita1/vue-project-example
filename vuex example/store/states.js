export const States = {
    partsSearchLocations: [],
    plannerBoardType: 'week',
    isLogout: false,
    cards: [],
    lastTimeForCards: 0,
    vehiclesForCustom: {},
    vehicleMakeModels: {},
    vehicleScheduleNumbers: {},
    menu: {},
    filter: {
        card: '',
        estimate: '',
        filterForMine: true,
        invoice: '',
    },
    jobs: [],
    butterfly: {
        bodies: {},
        categories: {},
        customMatrix: {},
        matrix: {},
        names: {},
        matrixOrder: {},
    },
    userInfo: {},
    users: {},
    vendorInfo: {
    },
    businessTypes: [],
    dashboardSummary: {},
    customerVehicles: [],
    insurers: [],
    insurances: [],
    assessors: [],
    activityLog: {
        'I': 'Internal System',
        'E': 'External System',
        'U': 'User'
    },
    status: '',
    token: localStorage.getItem('token') || '',
    addressStates: [
        {key: "ACT", value: "Australian Capital Territory"},
        {key: "QLD", value: "Queensland"},
        {key: "NT", value: "Northern Territory"},
        {key: "NSW", value: "New South Wales"},
        {key: "VIC", value: "Victoria"},
        {key: "TAS", value: "Tasmania"},
        {key: "SA", value: "South Australia"},
        {key: "WA", value: "Western Australia"},
    ],
    addressCountries: [
        {key: "AU", value: "Australia"},
        {key: "NZ", value: "New Zealand"},
    ],
    vehicleTransmissions: [
        {key: "Automatic", value: "Automatic"},
        {key: "Manual", value: "Manual"},
    ],
    roles: [
        {
            id: 2,
            label: 'Shop Manager',
            value: 'ShopManager',
        },
        {
            id: 10,
            label: 'Production Manager',
            value: 'ProductionManager',
        },
        {
            id: 3,
            label: 'Estimator',
            value: 'Estimator'
        },
        {
            id: 20,
            label: 'PDR Technician',
            value: 'PDRTechnician'
        },
        {
            id: 4,
            label: 'Panel Technician',
            value: 'PanelTechnician'
        },
        {
            id: 6,
            label: 'Paint Technician',
            value: 'PaintTechnician'
        },
        {
            id: 5,
            label: 'Customer Service',
            value: 'CustomerService',
        },
        {
            id: 7,
            label: 'Stripper & Fitter',
            value: 'StripperFitter'
        },
        {
            id: 8,
            label: 'Detailer',
            value: 'Detailer'
        },
        {
            id: 200,
            label: 'Display Board',
            value: 'DisplayBoard'
        },
    ],
    updateData: {},

    fileIdsInCardEdit: [],
    filesInCardEdit: [],
    isActiveLookup: false,
    isActiveLookupAlwaysOn: false,
};

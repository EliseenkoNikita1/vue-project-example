import { appConfig } from '../config.js'
import _ from 'lodash'

export const Getters = {
  getPartsSearchLocations: state => {
    return state.partsSearchLocations
  },
  getPlannerBoardType: state => {
    return state.plannerBoardType
  },
  getVehicleMakes: state => {
    let makes = []
    for (let make in state.vehicleMakeModels) {
      makes.push(make)
    }
    return makes
  },
  getVehicleModels: state => {
    let models = []
    for (let make in state.vehicleMakeModels) {
      for (let model in state.vehicleMakeModels[make].data) {
        models.push({
          make: make,
          model: model,
        })
      }
    }
    return models
  },
  getVehicleSeries: state => {
    let seriesArray = []
    for (let make in state.vehicleMakeModels) {
      for (let model in state.vehicleMakeModels[make].data) {
        for (let series in state.vehicleMakeModels[make].data[model].data) {
          seriesArray.push({
            make: make,
            model: model,
            series: series,
          })
        }
      }
    }
    return seriesArray
  },
  isStatusActive: state => {
    return state.vendorInfo.isActive
  },
  isRsEnabled: state => Boolean(state.vendorInfo.isRsEnabled),
  isLogoutAction: state => state.isLogout,
  authToken: state => state.token,
  isLoggedIn: state => Boolean(state.token && state.token !== undefined && state.token !== 'undefined' && state.token.length > 1),
  authStatus: state => state.status,
  addressStates: state => {
    return state.addressStates
  },
  addressCountries: state => {
    return state.addressCountries
  },
  vehicleTransmissions: state => {
    return state.vehicleTransmissions
  },
  butterflyCategories: state => {
    return state.butterfly.categories
  },
  butterflyMatrix: state => {
    return state.butterfly.matrix
  },
  butterflyCustomMatrix: state => {
    return state.butterfly.customMatrix
  },
  butterflyMatrixOrder: state => {
    return state.butterfly.matrixOrder
  },
  butterflySubcategories: state => {
    return state.butterfly.names
  },
  getMenu: state => {
    return state.menu
  },
  butterflyBodies: state => {
    return state.butterfly.bodies
  },
  fileIdsInCardEdit: state => {
    return state.fileIdsInCardEdit
  },
  cardFilter: state => {
    return state.filter.card
  },
  invoiceFilter: state => {
    return state.filter.invoice
  },
  isJustSeeMine: state => {
    return !!(state.userInfo && state.userInfo.isJustSeeMine)
  },
  estimateFilter: state => {
    return state.filter.estimate
  },
  userId: state => {
    return Number(state.userInfo.user_id)
  },
  userInfo: state => {
    return state.userInfo
  },
  vendorInfo: state => {
    return state.vendorInfo
  },
  getBusinessName: state => {
    return (state.vendorInfo && state.vendorInfo.business_name) ? state.vendorInfo.business_name : ''
  },
  avatar: state => {
    if (state.userInfo && state.userInfo.avatar) {
      return state.userInfo.avatar
    }
    return appConfig.baseAPIURL + '/img/avatars/default-avatar.jpg'
  },
  activeUsers: state => {
    let users = _.filter(state.users, (u) => {
      return (u.isActive === true)
    })
    return users
  },
  visibleUsers: state => {
    // let users = _.filter(state.users, (u) => {
    //     return (u.isActive === true && u.isVisible);
    // });
    let users = _.filter(state.users, (u) => {
      return (u.isActive === true)
    })
    return users
  },
  users: state => {
    return state.users
  },
  roles: state => {
    return state.roles
  },
  filesInCardEditGetter: state => {
    return state.filesInCardEdit
  },

  isShopManagerUser: state => {
    return !_.isEmpty(state.userInfo) && Number(state.userInfo.group_id) === 2
  },
  isAdministrator: state => {
    return false
  },
  isProductionManagerUser: state => {
    return !_.isEmpty(state.userInfo) && Number(state.userInfo.group_id) === 10
  },
  isEstimatorUser: state => {
    return !_.isEmpty(state.userInfo) && (Number(state.userInfo.group_id) === 3 || Number(state.userInfo.group_id) === -1)
  },
  isPDRTechnicianUser: state => {
    return !_.isEmpty(state.userInfo) && Number(state.userInfo.group_id) === 20
  },
  isTechnicalUser: state => {
    return !_.isEmpty(state.userInfo) && Number(state.userInfo.group_id) === 4
  },
  isPanelTechnicianUser: state => {
    return !_.isEmpty(state.userInfo) && Number(state.userInfo.group_id) === 4
  },
  isPaintTechnicianUser: state => {
    return !_.isEmpty(state.userInfo) && Number(state.userInfo.group_id) === 6
  },
  isCustomerUser: state => {
    return !_.isEmpty(state.userInfo) && Number(state.userInfo.group_id) === 5
  },
  isStripperFitterUser: state => {
    return !_.isEmpty(state.userInfo) && Number(state.userInfo.group_id) === 7
  },
  isDetailerUser: state => {
    return !_.isEmpty(state.userInfo) && Number(state.userInfo.group_id) === 8
  },
  isDisplayBoardUser: state => {
    return !_.isEmpty(state.userInfo) && Number(state.userInfo.group_id) === 200
  },
  totalFiles: state => {
    return state.filesInCardEdit.length
  },

  updateDataGetter: state => {
    return state.updateData
  },

  cards: state => {
    return state.cards
  },

  lastTimeForCards: state => {
    return state.lastTimeForCards
  },
}

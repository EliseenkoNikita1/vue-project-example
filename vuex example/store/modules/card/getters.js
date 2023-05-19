import _ from 'lodash'

export const Getters = {
  getSortByForCardsAll: (state) => {
    return state.sortByForCardsAll
  },
  getSortDescForCardsAll: (state) => {
    return state.sortDescForCardsAll
  },
  getSortByForCardsOpen: (state) => {
    return state.sortByForCardsOpen
  },
  getSortDescForCardsOpen: (state) => {
    return state.sortDescForCardsOpen
  },
  getSortByForCardsActive: (state) => {
    return state.sortByForCardsActive
  },
  getSortDescForCardsActive: (state) => {
    return state.sortDescForCardsActive
  },
  getSortByForCardsClosed: (state) => {
    return state.sortByForCardsClosed
  },
  getSortDescForCardsClosed: (state) => {
    return state.sortDescForCardsClosed
  },
  getPerPage: (state) => {
    return state.perPage
  },
  getCardsAllCurrentPage: (state) => {
    return state.cardsAllCurrentPage
  },
  getCardsOpenCurrentPage: (state) => {
    return state.cardsOpenCurrentPage
  },
  getCardsActiveCurrentPage: (state) => {
    return state.cardsActiveCurrentPage
  },
  getCardsClosedCurrentPage: (state) => {
    return state.cardsClosedCurrentPage
  },
  getCardsByFilterMine (state, getters, rootState, rootGetters) {
    if (rootGetters.isJustSeeMine
      && (rootGetters.isEstimatorUser || rootGetters.isPanelTechnicianUser || rootGetters.isPaintTechnicianUser || rootGetters.isStripperFitterUser)) {
      let uid = rootGetters.userId
      return _.filter(state.items, function (i) {
        return (i.assigned_to && Number(i.assigned_to.id) > 0 && Number(i.assigned_to.id) == uid)
      })
      //return state.items;
    }
    //else if (rootGetters.isEstimatorUser || rootGetters.isPanelTechnicianUser || rootGetters.isPaintTechnicianUser || rootGetters.isStripperFitterUser) {
    //
    //}
    return state.items
  },
  getCardsAssignedToMe (state, getters, rootGetters) {
    let uid = rootGetters.userInfo.user_id
    return _.orderBy(_.filter(state.items, function (i) {
      return (i.assigned_to && Number(i.assigned_to.id) > 0 && Number(i.assigned_to.id) == uid)
    }), ['assignedTo.date'], ['desc'])
  },
  getAllCards: (state, getters) => {
    let cards = _.orderBy(getters.getCardsByFilterMine, ['card_id'], ['desc'])
    return cards
  },
  getOpenCards: (state, getters) => {
    let cards = _.filter(getters.getCardsByFilterMine, function (i) {
      return Number(i.state) === 0
    })
    return cards
  },
  getClosedCards: (state, getters) => {
    let cards = _.filter(getters.getCardsByFilterMine, function (i) {
      return Number(i.state) === 3
    })
    return cards
  },
  getActiveCards: (state, getters) => {
    let cards = _.filter(getters.getCardsByFilterMine, function (i) {
      return (Number(i.state) !== 3 && Number(i.state) !== 0)
    })
    return cards
  },
  getTimestamp: state => {
    return state.timestamp
  },
  countNewEmails: (state, getters) => {
    let array = _.filter(getters.getCardsByFilterMine, function (i) {
      return (i.activity && i.activity.Email && i.activity.Email.date)
    })
    return array.length || 0
  },
  countNewTasks: (state, getters) => {
    let array = _.filter(getters.getCardsByFilterMine, function (i) {
      return (i.isHasNewTask)
    })
    return array.length || 0
  },
  hiddenStatuses: state => {
    return state.hiddenStatuses
  }
}

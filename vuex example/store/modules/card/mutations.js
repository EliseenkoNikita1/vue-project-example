import _ from "lodash";

export const Mutations = {
    setSortDescForCardsAll(state, ui) {
        state.sortDescForCardsAll = ui;
    },
    setSortByForCardsAll(state, ui) {
      state.sortByForCardsAll = ui;
    },
    setSortDescForCardsOpen(state, ui) {
        state.sortDescForCardsOpen = ui;
    },
    setSortByForCardsOpen(state, ui) {
        state.sortByForCardsOpen = ui;
    },
    setSortDescForCardsActive(state, ui) {
        state.sortDescForCardsActive = ui;
    },
    setSortByForCardsActive(state, ui) {
        state.sortByForCardsActive = ui;
    },
    setSortDescForCardsClosed(state, ui) {
        state.sortDescForCardsClosed = ui;
    },
    setSortByForCardsClosed(state, ui) {
        state.sortByForCardsClosed = ui;
    },
    setPerPage(state, ui) {
      state.perPage = ui;
    },
    setCardsAllCurrentPage(state, ui) {
      state.cardsAllCurrentPage = ui;
    },
    setCardsOpenCurrentPage(state, ui) {
        state.cardsOpenCurrentPage = ui;
    },
    setCardsActiveCurrentPage(state, ui) {
        state.cardsActiveCurrentPage = ui;
    },
    setCardsClosedCurrentPage(state, ui) {
        state.cardsClosedCurrentPage = ui;
    },
    loadCards(state, ui) {
        //console.log('ui', ui);
        let data = _.union(ui, state.items);
        //console.log('data', data);
        let res = _.uniqWith(data, function (first, second) {
            return (first.card_id != second.card_id) ? false : true;
        });
        res = _.map(res, (i) => {
            i.card_id = Number(i.card_id);
            return i;
        });
        //console.log('res', res);
        state.items = res;
    },
    updateUserHiddenStatuses(state, ui){
      state.hiddenStatuses.userHiddenStatuses = ui;
    },
    updateVendorHiddenStatuses(state, ui){
      state.hiddenStatuses.vendorHiddenStatuses = ui;
    },
    setTimestamp(state, timestamp = 0) {
        console.log('timestamp', timestamp);
        state.timestamp = timestamp;
    },
    logout(state) {
        state.timestamp = 0;
        state.items = [];
    },
    cardsUpdated (state, ui) {
        let newCards = _.map(ui, (i) => {
            i.card_id = Number(i.card_id);
            return i;
        });
        state.items = _.unionBy(newCards, state.items, "card_id");
    },
    deleteCardById(state, id){
        let removedCardIndex = _.findIndex(state.items, function(card) {
          return parseInt(card.card_id) === parseInt(id);
        });
        if (removedCardIndex !== -1) {
            state.items.splice(removedCardIndex, 1);
        }
      }
}

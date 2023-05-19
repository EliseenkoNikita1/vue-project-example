<script>
/* eslint-disable */
import 'vue-form-wizard/dist/vue-form-wizard.min.css'
import vue2Dropzone from 'vue2-dropzone'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import QuotePricingProgress from '@/components/rfq/QuotePricingProgress'
import RfqTimer from './rfq-view/rfq-timer'
import ImageLightbox from '@/components/image-lightbox/image-lightbox'
import ImageLightboxWithoutGallery from './rfq-view/image-lightbox'
import ImageGallery from './rfq-view/image-gallery'
import Axios from 'axios'
import _ from 'lodash'
import RFQ from '../../../components/rfq/models/RFQ'
import Part from '../../../components/rfq/models/Part'
import PartListView from './rfq-view/part-list'
import vinDate from '../../../components/VinDate'
import CustomerAccountDeliver from '../../../components/CustomerAccountDeliver'
import { isMobileOnly, deviceType } from 'mobile-device-detect'
import FileUpload from './rfq-view/file-upload'
import { mapActions, mapGetters } from 'vuex'
import NProgress from 'nprogress'
import RFQImport from './rfq-view/rfq-import-quote-pdf'
import { fetchAllUsers } from '../../../store/modules/users/actions'

export default {
  name: 'supplier-rfq-view',
  data: function () {
    return {
      priceResubmitActiveFlag: false,
      widthStyle: {},
      isDropdown2Visible: false,
      isOldCompactSideBar: null,
      pinImage: null,
      activeTab: null,
      isEditPartList: false,
      isEditVehicleDetails: false,
      classTabContent: 'tab-content',
      isHiddenOptions: true,
      shownGallery: false,
      galleryCurrentIndex: 0,
      steps: [
        { label: 'Received Request for Quotes', },
        { label: 'Priced', },
        { label: 'Lost', },
        { label: 'Won', },
        { label: 'Parts Ordered', },
      ],
      isSelectedImportDMS: false,
      isLoadPartsForImporting: false,
      isStartImportingParts: false,
      isLoading: false,
      rfq: { //TODO remove after testing
        rfqUpdateRequested: '',
        id: null,
        QPNumber: '',
        type: 'Manual',
        number: '',
        comments: '',
        estimator: '',
        vehicle: {
          rego: '',
          vin: '',
          make: '',
          model: '',
          series: '',
          dom: '',
          colour: '',
          transmission: 'Automatic',
          odometer: '',
        },
        repairer: '',
        statusId: 1,
        status: '',
        supplierQuoteNumber: '',
        repairerQuoteNumber: '',
        parts: [],
        images: [],
        files: [],
        suppliers: [],
        partsToSuppliers: {},
        partsType: '',
        dueCountdown: 0,
        dmsQuoteNumber: 0,
        paintCodeForRepair: '',
        properties: {
          isAskForPaintCode: false,
        },
      },
      importedParts: [],
      imageIds: [],
      interval: null,
      offers: [],
      partListFields: [
        {
          label: 'Name',
          key: 'name',
          sortable: true,
          tdClass: 'clickable part-name',
          thClass: 'text-left part-name align-top'
        },
        {
          label: 'Part Number',
          key: 'number',
          sortable: true,
          tdClass: 'clickable part-number',
          thClass: 'text-left part-number align-top'
        },
        {
          label: 'OEM',
          key: 'oem',
          sortable: false,
          tdClass: 'clickable text-center part-type',
          thClass: 'text-center part-type align-top'
        },
        {
          label: 'USED',
          key: 'used',
          sortable: false,
          tdClass: 'clickable text-center part-type',
          thClass: 'text-center part-type align-top'
        },
        {
          label: 'AFT-M',
          key: 'aftm',
          sortable: false,
          tdClass: 'clickable text-center part-type',
          thClass: 'text-center part-type align-top'
        },
        {
          label: 'RECO',
          key: 'reco',
          sortable: false,
          tdClass: 'clickable text-center part-type',
          thClass: ' text-center part-type align-top'
        },
        {
          label: 'Qty',
          key: 'qty',
          sortable: true,
          tdClass: 'clickable part-qty',
          thClass: 'text-center part-qty align-top'
        },
        {
          label: 'Action',
          key: 'action',
          sortable: false,
          tdClass: 'clickable part-action text-center',
          thClass: 'text-center part-action align-top'
        },
      ],
    }
  },
  computed: {
    ...mapGetters({
      companyInfo: 'currentCompany/getDetails',
      isOEM: 'currentCompany/isOEM',
      currentRFQ: 'supplier/rfq/getCurrentRFQ'
    }),
    isFlashingPaintCode () {
      if (!this.isRFQNew && !this.isRFQPriced) {
        return false
      }
      if (this.rfq && this.rfq.paintCodeForRepair && this.rfq.paintCodeForRepair.length > 0) {
        return false
      }
      return true
    },
    computedImportedParts () {
      return this.importedParts
    },
    isCanEditPriceQuote () {
      return !!(this.isRFQPriced && ((this.isOEM) || (!this.isOEM && this.computedDueDate > 0) || this.rfq.rfqUpdateRequested === 'UpdateRequested'))
    },
    deliveryTo () {
      let result = ''
      if (!_.isEmpty(this.rfq.order) && !_.isEmpty(this.rfq.order.deliveryTo)) {
        result = this.rfq.order.deliveryTo
      } else if (!_.isEmpty(this.rfq.deliveryAddress)) {
        result = this.rfq.deliveryAddress
      } else if (!_.isEmpty(this.rfq.location)) {
        result = this.rfq.location
      }
      return result
    },
    viewRfqsTableLink () {
      let link = '/s/rfqs#'
      link = link + _.toLower(this.rfq.status)
      return link
    },
    isPinImage: function () {
      if (this.pinImage && (this.isCurrentTabVehicleDetails || this.isCurrentTabPartList || this.isCurrentTabFiles)) {
        return true
      }
      return false
    },
    isMobileOnly () {
      return isMobileOnly
    },
    getDeviceType () {
      return deviceType
    },
    imageSource: function () {
      return this.rfq.images
    },
    isEditable: function () {
      if (this.isEditableVehicleDetails || this.isEditablePartList) {
        return true
      }
      return false
    },
    isEditablePartList: function () {
      if (this.isEditPartList) {
        return true
      }
      return false
    },
    isEditableVehicleDetails: function () {
      if (this.isEditVehicleDetails) {
        return true
      }
      return false
    },
    isCurrentTabVehicleDetails: function () {
      if (this.$route.meta.currentTab == 'Vehicle Details' || this.activeTab == 'Vehicle Details') {
        return true
      }
      return false
    },
    isCurrentTabPartList: function () {
      if (this.$route.meta.currentTab == 'Part List' || this.activeTab == 'Part List') {
        return true
      }
      return false
    },
    isCurrentTabFiles: function () {
      if (this.$route.meta.currentTab == 'Files' || this.activeTab == 'Files') {
        return true
      }
      return false
    },
    isRFQOrdered: function () {
      return this.rfq.status === 'Ordered'
    },
    isRFQCancelled: function () {
      return this.rfq.status === 'Closed'
    },
    isRFQClosed: function () {
      return this.rfq.status === 'Closed'
    },
    isRFQNew: function () {
      return this.rfq.status === 'New'
    },

    isRFQPriced: function () {
      return this.rfq.status === 'Priced'
    },
    isRFQWon: function () {
      return this.rfq.status === 'Won'
    },
    computedDueDate: function () {
      return this.rfq.dueCountdown
    },
    currentQPPStep: function () {
      if (this.rfq.statusId > 0) {
        return this.rfq.statusId
      }
      return 1
    },
    stepCanEdit () {
      switch (this.currentQPPStep) {
        // add more step that can't edit here
        case 1:
          return false
        default:
          return true
      }
    },
    pageTitle () {
      return `Edit Quote - ${this.rfq.number} | ${this.rfq.vehicle.make} ${this.rfq.vehicle.model}`
    },
    mobileOptionsClass () {
      const titleLength = this.pageTitle.length
      if (
        titleLength >= 27 && titleLength <= 38 ||
        titleLength >= 62 && titleLength <= 69
      ) {
        return 'top-15'
      }
    }
  },
  methods: {
    ...mapActions({
      getRFQById: 'supplier/rfq/getRFQById'
    }),
    addDelivery (id) {
      // this.loadRFQ(0, () => {
      //   this.$refs.partLV.focusElement('deliveryName-' + id)
      // });
    },
    sortParts () {
        return;
      let parts = _.orderBy(_.cloneDeep(this.rfq.parts), [(itm) => Number(itm.listOrderNumber), (itm) => Number(itm.id)])
      //parts = _.orderBy(parts, [(itm) => Number(itm.listOrderNumber)])
      // _.forEach(parts, (prt, index) => {
      //   if (prt.listOrderNumber === 999) {
      //     prt.listOrderNumber = index;
      //   }
      // })
        return;
      let data = { parts: [] };
      parts.forEach(prt => {
        data.parts.push({
          id: prt.id,
          listOrderNumber: prt.listOrderNumber
        })
      })

      let isHasChanges = _.some(this.rfq.parts, (prt) => {
        let newPrt = _.find(parts, (p) => {
          return Number(p.id) === Number(prt.id)
        })
        return !(newPrt && newPrt.listOrderNumber === prt.listOrderNumber)
      })

      if (!isHasChanges) {
        return
      }

      Axios.post('/ir/supplier/rfq/' + this.rfq.id, data)
          .then(() => {
            this.rfq.parts = parts
          })
          .catch(error => {
            console.log(error)
          }).finally(() => {
      })
    },
    viewOrder () {
      if (this.rfq && this.rfq.order && this.rfq.order.id) {
        this.$router.push({ name: 'SupplierPartsOrderView', params: { orderId: this.rfq.order.id } })
      } else {
        this.$toast.error('Can not find order')
      }
    },
    setCurrentViewing () {
      let timestamp = this.$store.getters['updater/lastTimestamp']
      Axios.get('/ir/update/rfq-to-supplier/' + this.$route.params.rfq_id + '/' + timestamp)
        .then(response => {
          if (response.data.status) {
          }
        })
    },
    confirmedImport (data) {
      this.$set(this, 'importedParts', data)
    },
    initMenu () {
      this.$root.$on('bv::dropdown::show', bvEvent => {
        if (bvEvent.componentId === 'dropdown-2') {
          this.isDropdown2Visible = true
        }
      })
      this.$root.$on('bv::dropdown::hide', bvEvent => {
        if (bvEvent.componentId === 'dropdown-2') {
          this.isDropdown2Visible = false
          if (!_.isEmpty(this.$refs.optionMenu)) this.$refs.optionMenu.hide()
        }
        if (this.isDropdown2Visible) {
          bvEvent.preventDefault()
        }
      })
    },
    setRequestTimeExtension (time) {
      NProgress.start()
      let id = this.rfq.id
      Axios.post('/ir/supplier/rfq/' + id + '/request-time-extension', {
        rfqId: id,
        time: time
      }).then(response => {
        if (response.data && response.data.status && response.data.status === true) {
          this.$toast.success('Request has been processed')
          this.loadRFQ(id)
          this.$store.dispatch('supplier/rfq/init', {}, { root: true })
          return
        }
        this.$toast.error('Request hasn`t been processed')
      }).catch(error => {
        console.log(error)
        this.$toast.error('Request hasn`t been processed')
      }).finally(() => {
        NProgress.done()
      })
    },
    deleteQuote () {
      Axios.post('/ir/supplier/rfq/' + this.rfq.id + '/delete', {
        rfqId: this.rfq.id
      }).then(response => {
        this.$toast.success('Quote has been delete')
        this.$store.dispatch('supplier/rfq/init', {}, { root: true })
        this.$router.push('/s/rfqs/#closed')
      }).catch(error => {
        this.$toast.error('Quote haven\'t been delete')
        console.log(error)
      })
    },
    sendPartNumbers () {
      Axios.post(`/ir/supplier/rfq/${this.rfq.id}/send-part-numbers`, {
        rfqId: this.rfq.id
      }).then(response => {
        if (response.data._status) {
          this.$toast.success('Part Nbrs has been sent to Repairer')
        }
      }).catch(error => {
        this.$toast.error('Cannot Send Part Nbrs/List!')
        console.log(error)
      })
    },
      closeQuote () {
      Axios.post('/ir/supplier/rfq/' + this.rfq.id + '/close', {
        rfqId: this.rfq.id
      }).then(response => {
        this.$toast.success('Quote has been closed')
        this.$store.dispatch('supplier/rfq/init', {}, { root: true })
        this.loadRFQ(this.rfq.id)
      }).catch(error => {
        this.$toast.error('Quote haven\'t been closed')
        console.log(error)
      })
    },
    importQuote () {
      this.$refs['supplier-rfq-view-table'].selectTab('#part-list')
      this.isSelectedImportDMS = true
    },
    processOrder () {
      let id = this.rfq.id
      Axios.post('/ir/supplier/rfq/' + id + '/process-order', { rfqId: id })
        .then(response => {
          if (response.data && response.data.status && response.data.status == true) {
            this.$toast.success('Order has been processed')
            if (response.data.orderId) {
              this.$router.push({ name: 'SupplierPartsOrderView', params: { orderId: String(response.data.orderId) } })
            } else {
              this.loadRFQ(id)
            }
            this.$store.dispatch('supplier/rfq/init', {}, { root: true })
            return
          }
          this.$toast.error('Order hasn`t been processed')
        })
        .catch(error => {
          console.log(error)
          this.$toast.error('Order hasn`t been processed')
        })
    },
    updatePaintCodeForRepair () {
      Axios.post('/ir/supplier/rfq/' + this.rfq.id, {
        setPaintCodeForRepair: this.rfq.paintCodeForRepair
      }).then(response => {
        if (response.data.status) {
        } else {
          this.$toast.error('Cannot save Paint Code')
        }
      }).catch(error => {
        this.$toast.error('Cannot save Paint Code')
      })
    },
    addImportedPdf (fileId) {
      Axios.post('/ir/supplier/rfq/' + this.rfq.id, {
        fileIds: [fileId]
      }).then(response => {
        if (response.data._status && response.data.rfq) {
          this.rfq.files = response.data.rfq.files
        } else {
          this.$toast.error('Cannot add Pdf in the File section')
        }
      }).catch(error => {
        this.$toast.error('Cannot add Pdf in the File section')
        console.log(error)
      })
    },
    updateSupplierQuoteNumber (val=null) {
      NProgress.start();
      let supplierQuoteNumber = this.rfq.supplierQuoteNumber
      if (val)
      {
          supplierQuoteNumber = val
          this.rfq.supplierQuoteNumber = val
      }
      // this.rfq.dmsQuoteNumber = this.rfq.dmsQuoteNumber.substr(0,15);
      Axios.post('/ir/supplier/rfq/' + this.rfq.id, {
        setSupplierQuoteNumber: supplierQuoteNumber
      }).then(response => {
        if (response.data.status) {
          //this.loadRFQ(this.rfq.id)
        } else {
          this.$toast.error('Cannot save Quote Number')
        }
      }).catch(error => {
        this.$toast.error('Cannot save Quote Number')
        console.log(error)
      })
      .finally(() => {
        NProgress.done();
      })
    },
    pinClickImage: function (index) {
      this.shownGallery = true
      this.galleryCurrentIndex = index
    },
    onCloseGallery: function () {
      this.shownGallery = false
    },
    reversedImageList () {
      return this.imageSource.slice().reverse()
    },
    changedTab: function (obj) {
      this.activeTab = obj.tab.name
      setTimeout(() => {
        this.calculateWidth()
      }, 10)
    },
    editVehicleDetails: function () {
      this.isEditVehicleDetails = true
    },
    editPartList: function () {
      this.isEditPartList = true
    },
    cancelEdit: function () {
      this.isEditPartList = false
      this.isEditVehicleDetails = false
    },
    autoFileImage: function (event) {
      let update = {}
      update.fileIds = this.fileIds
    },
    sendImgUpload ($event) {
      $event.previewElement.children[($event.previewElement.children.length - 1)].style.display = 'none'
    },
    checkOfferForOrder: function (partId, offerId) {
      if (this.ifOfferChecked(partId, offerId)) {
        _.remove(this.offers, function (i) {
          return i.offerId == offerId
        })
        this.offers.push({ partId: partId, offerId: 0 })
      } else {
        _.remove(this.offers, function (i) {
          return i.offerId == offerId
        })
        this.offers.push({ partId: partId, offerId: offerId })
      }
    },
    setUpperCaseOfRego: function () {
      this.rfq.vehicle.rego = _.toUpper(this.rfq.vehicle.rego)
    },
    setUpperCaseOfMake: function () {
      this.rfq.vehicle.make = _.toUpper(this.rfq.vehicle.make)
    },
    setUpperCaseOfVIN: function () {
      this.rfq.vehicle.vin = _.toUpper(this.rfq.vehicle.vin)
    },
    loadRFQ: function (id = 0, callback = false) {
      if (!id) id = this.rfq.id
      console.log('loadRFQ')
      this.getRFQById(id).then(response => {
        if (!response.data.status) {
          this.$toast.error('Page not found')
          this.$router.push('/s')
        } else {
          if (!_.isEmpty(response.data.rfq)) {
            this.rfq = new RFQ(response.data.rfq);
            if (callback) {
              callback();
            }
          //  this.sortParts();
          }

        }
      }).catch(error => {
        console.log(error)
      })
    },
    partListPriced () {
      this.loadRFQ(this.rfq.id)
      //this.$store.dispatch('supplier/rfq/init', {}, { root: true })
    },
    vehicleDetailsTabChange () {
      this.isHiddenOptions = false
      this.classTabContent = 'tab-content-table'
    },
    partListTabChange () {
      this.isHiddenOptions = true
      this.classTabContent = 'tab-content-table'
    },
    imagesTabChange () {
      this.isHiddenOptions = false
      this.classTabContent = 'tab-content-table'
    },
    filesTabChange () {
      this.cardSaveElement = 'Files'
      this.isHiddenOptions = false
      this.classTabContent = 'tab-content-table'
    },
    clickBrowse: function (id) {
      $(id).trigger('click')
    },
    calculateWidth () {
      if (!this.$refs.partLV) {
        return
      }
      let w = this.$refs.partLV.$el.querySelector('div').clientWidth
      if (!w) {
        return
      }
      w += 24
      this.widthStyle = {
        width: w + 'px'
      }
    },
    addOptional (part) {
      // sample optional-part data
      const index = this.rfq.parts.findIndex(_part => part.id === _part.id)
      //    console.log('adding optional part to ', part, index);
      if (index >= 0) {
        this.rfq.parts.splice(index + 1, 0, new Part({
          id: null,
          price: 0,
          status: null,
          qty: this.rfq.parts[index].qty,
          comment: '',
          name: 'Optional Part',
          partNumber: '',
          rrp: null,
          stock: 0,
          stockComment: '',
          optionalPartComplete: true,
          type: 'optional' // assumed optional part type defined here
        }))

      } else {
        console.log('Part selected not found')
      }
    },
    setOptionalType (optionalPart, typeName) {
      const partIndex = this.rfq.parts.findIndex(_part => _part === optionalPart)
      if (partIndex) {
        this.rfq.parts[partIndex].name = this.rfq.parts[partIndex].name.split(' - ')[0].concat([` - ${typeName}`])
        this.rfq.parts[partIndex].optionalPartComplete = true
      }
    }
  },
  created: function () {
    let id = this.$route.params.rfq_id
    this.loadRFQ(id)
    this.calculateWidth()
  },
  beforeDestroy () {
    if (this.interval !== null) {
      clearInterval(this.interval)
    }
  },
  mounted: function () {
    // this.loadRFQ(this.$route.params.rfq_id);
    this.initMenu()
    this.calculateWidth()
    setInterval(() => {this.calculateWidth()}, 500)
    this.interval = setInterval(() => {
      this.setCurrentViewing()
    }, 5000)
  },
  filters: {
    maxFour (str) {
      switch (str) {
        case 'New':
          return 'New'
        case 'Priced':
          return 'Prcd'
        case 'Lost':
          return 'Lost'
        case 'Won':
          return 'Won'
        case 'Ordered':
          return 'Ord'
        case 'Cancelled':
          return 'Canc'
        default:
          return str.substring(0, 4)
      }
    }
  },
  components: {
    PartListView,
    QuotePricingProgress,
    RfqTimer,
    ImageLightbox,
    ImageLightboxWithoutGallery,
    ImageGallery,
    vinDate,
    CustomerAccountDeliver,
    vueDropzone: vue2Dropzone,
    FileUpload,
    RFQImport,
  },
  watch: {
    currentRFQ: {
      handler: function (val) {
        console.log('currentRFQ', val)
        this.rfq.rfqUpdateRequested = val.rfqUpdateRequested
        if (val && val.status != '' && this.rfq.status != '' && val.status != this.rfq.status) {
          this.loadRFQ(this.$route.params.rfq_id)
          return
        }
        // if (val.hasOwnProperty('supplierQuoteNumber') && val.supplierQuoteNumber !== this.rfq.supplierQuoteNumber) {
        //   this.rfq.supplierQuoteNumber = val.supplierQuoteNumber;
        // }
        if (val.hasOwnProperty('repairerQuoteNumber') && val.repairerQuoteNumber !== this.rfq.repairerQuoteNumber) {
          this.rfq.repairerQuoteNumber = val.repairerQuoteNumber;
        }
        if (val && val.partsToSuppliers) {
          for (let suppId in val.partsToSuppliers) {
            _.forEach(val.partsToSuppliers[suppId].parts, newPart => {
              if (!this.rfq.suppliers[suppId]) {
                return
              }
              let indexOfOldPart = _.findIndex(this.rfq.suppliers[suppId].parts, prt => {
                return Number(prt.originalPartId) === Number(newPart.originalPartId)
              })
              if (indexOfOldPart === -1) {
                return
              }
              let oldPart = this.rfq.suppliers[suppId].parts[indexOfOldPart]
              if (oldPart) {
                if (oldPart.price !== newPart.price) {
                  this.$set(this.rfq.suppliers[suppId].parts[indexOfOldPart], 'price', newPart.price)
                  if (newPart.firstPrice) {
                    this.$set(this.rfq.suppliers[suppId].parts[indexOfOldPart], 'firstPrice', newPart.firstPrice)
                  }
                }
                if (oldPart.listOrderNumber !== newPart.listOrderNumber) {
                  console.log('watcher.currentRfq', newPart.listOrderNumber)
                  //this.$set(this.rfq.suppliers[suppId].parts[indexOfOldPart], 'listOrderNumber', newPart.listOrderNumber)
                }
              }
            })
          }
        }
        // if (val && val.parts) {
        //   let _parts = []
        //   _.forEach(val.parts, part => {
        //     _parts.push(new Part(part))
        //   })
        //   _parts = _.orderBy(_parts, [(itm) => Number(itm.listOrderNumber), (itm) => Number(itm.id)])
        //  this.rfq.parts = _parts
        //   this.sortParts();
        // }
        if (val && val.estimator) {
          this.rfq.estimator = val.estimator
        }

        //    if (!_.isEmpty(val)) this.rfq = new RFQ(val)
      },
      deep: true,
      immediate: true,
    },
    pinImage (val) {
      if (!val) this.shownGallery = val
      if (val) {
        let body = document.querySelector('body')
        if (body.classList.contains('compact-sidebar')) {
          this.isOldCompactSideBar = true
          body.classList.remove('compact-sidebar')
        } else {
          this.isOldCompactSideBar = false
        }

      } else {
        if (this.isOldCompactSideBar) {
          let body = document.querySelector('body')
          body.classList.add('compact-sidebar')
        }
      }
    }
  }
}
</script>
<template>
    <div class="supplier-rfq-view-page">
        <div class="page-header">
            <h4>{{ pageTitle }}</h4>
            <ol class="breadcrumbs">
                <li class="breadcrumb-item home">
                    <router-link to="/s">Home</router-link>
                </li>
                <li class="breadcrumb-item">
                    <router-link :to="{path:this.viewRfqsTableLink}">View Quotes</router-link>
                </li>
                <li class="breadcrumb-item active">
                    <span class="d-inline-block d-lg-none">Edit {{ rfq.status | maxFour }} Quote</span>
                    <span class="d-none d-lg-inline-block">Edit {{ rfq.status }} Quote</span>
                </li>
            </ol>
            <!-- <div class="page-header-nav-options">
              <b-dropdown id="supplier-rfq-view-options" ref="optionMenu" right text="Options" class="dropdown-options"
                          :class="mobileOptionsClass">
                <template v-slot:button-content>Options
                  <span class="dropdown-arrow">
                                  <i class='bx bx-down-arrow'></i>
                              </span>
                </template>
                <b-dropdown v-if="rfq.id && isOEM && isRFQNew && rfq.isExtensionTime()" id="dropdown-2" dropleft
                            text="Request Time Extension" class="request-time-extension">
                  <b-dropdown-item @click="setRequestTimeExtension(30)">30 mins</b-dropdown-item>
                  <b-dropdown-item @click="setRequestTimeExtension(60)">1 hour</b-dropdown-item>
                  <b-dropdown-item @click="setRequestTimeExtension(90)">1.5 hours</b-dropdown-item>
                  <b-dropdown-item @click="setRequestTimeExtension(120)">2.0 hours</b-dropdown-item>
                </b-dropdown>
                <b-dropdown-item v-if="isCanEditPriceQuote" @click="priceResubmitActiveFlag = true">Edit Priced Quote
                </b-dropdown-item>
                <b-dropdown-item v-if="isRFQNew && !isSelectedImportDMS" @click="importQuote" class="import-dms-option">Import DMS Quote PDF</b-dropdown-item>
                          <b-dropdown-item v-if="!isRFQWon && !isRFQClosed" @click="closeQuote">Close Rfq</b-dropdown-item>
                <b-dropdown-item v-if="isRFQClosed" @click="deleteQuote">Delete Rfq</b-dropdown-item>
                <b-dropdown-item v-if="isEditable" @click="cancelEdit">Cancel Edit</b-dropdown-item>
                <b-dropdown-item v-if="isRFQWon" @click="processOrder">Process Order</b-dropdown-item>
                <label v-if="!isMobileOnly" class="form-check-inline checkbox nav-pin-images py-4 px-3 my-2">
                  <input class="form-check-input" name="pinimage" v-model="pinImage" type="checkbox">
                  <span class="icon"><i class='bx bx-check'></i></span><span class="text">Pin Images</span>
                </label>
              </b-dropdown>
            </div> -->
        </div>
        <div class="rfq-view-body">
            <tabs ref="supplier-rfq-view-table" cache-lifetime="0" :options="{useUrlFragment: false}"
                  @changed="changedTab">
                <tab name="Vehicle Details" id="vehicle-details" :class-name="'tab-content-table'">
                    <div class="row">
                        <div class="col-12 col-lg-5 part-list-qoute-pricing-progress">
                            <quote-pricing-progress
                                    :steps="steps"
                                    :step="currentQPPStep">
                            </quote-pricing-progress>
                        </div>

                        <div class="w-100 d-block d-xl-none"></div>

                        <div class="col-12 col-sm-6 col-lg-4">
                            <rfq-timer :countdown="computedDueDate"
                                       :date-due="rfq.dateDue"
                                       :date-due-prop="rfq.dateDue"
                                       :extensionTimes="rfq.extensionTime">
                            </rfq-timer>
                            <div class="form-group row">
                                <label class="col col-form-label pl-0 color-lightgray" style="font-size: 1rem;">Comments :</label>
                                <div class="col-9">
                                <textarea
                                    class="form-control"
                                    placeholder=""
                                    rows="3"
                                    :disabled="true"
                                    v-model="rfq.vehicle.comments">
                                </textarea>
                                </div>
                            </div>
                        </div>

                        <div class="col-12 col-sm-6 col-lg ml-lg-0 m-lg-0">
                            <customer-account-deliver
                                    label-business="Customer"
                                    label-address="Deliver To"
                                    :customer="rfq.repairer"
                                    account=""
                                    :delivery-to="deliveryTo"
                                    :estimator="rfq.estimator"
                            ></customer-account-deliver>
                        </div>
                        <div class="wizard__divider"></div>
                    </div>

                    <div class="vehicle-details-block block">
                        <div class="block-header bg-navyblue">
                            Vehicle Details
                        </div>
                        <div class="block-body bg-white">
                            <div class="form-group row">
                                <label class="col col-form-label">Repairer Quoting Package Nbr</label>
                                <div class="col-8">
                                    <input type="text" class="form-control" v-model="rfq.QPNumber" :disabled="true">
                                </div>
                            </div>
                            <div class="form-group row">
                                <label class="col col-form-label">Repairer Name</label>
                                <div class="col-8">
                                    <input type="text" class="form-control" placeholder="" v-model="rfq.repairer"
                                           :disabled="true">
                                </div>
                            </div>


                            <div class="form-group row">
                                <label class="col col-form-label">Rego</label>
                                <div class="col-8">
                                    <input type="text" class="form-control" placeholder="" v-model="rfq.vehicle.rego"
                                           :disabled="true">
                                </div>
                            </div>
                            <div class="form-group row">
                                <label class="col col-form-label">VIN Number</label>
                                <div class="col-8">
                                    <input type="text" class="form-control" v-model="rfq.vehicle.vin" :disabled="true">
                                </div>
                            </div>
                            <div class="form-group row">
                                <label class="col col-form-label">Build Date</label>
                                <div class="col-8">
                                    <input type="text" class="form-control" v-model="rfq.vehicle.dom" :disabled="true">
                                </div>
                            </div>
                            <div class="form-group row">
                                <label class="col col-form-label">Make</label>
                                <div class="col-8">
                                    <input type="text" class="form-control" v-model="rfq.vehicle.make" :disabled="true">
                                </div>
                            </div>
                            <div class="form-group row">
                                <label class="col col-form-label">Model</label>
                                <div class="col-8">
                                    <input type="text" class="form-control" v-model="rfq.vehicle.model"
                                           :disabled="true">
                                </div>
                            </div>
                            <div class="form-group row">
                                <label class="col col-form-label">Series</label>
                                <div class="col-8">
                                    <input type="text" class="form-control" placeholder="" v-model="rfq.vehicle.series"
                                           :disabled="true">
                                </div>
                            </div>
                            <div class="form-group row">
                                <label class="col col-form-label">Colour</label>
                                <div class="col-8">
                                    <input type="text" class="form-control" placeholder="" v-model="rfq.vehicle.colour"
                                           :disabled="true">
                                </div>
                            </div>
                            <div class="form-group row">
                                <label class="col col-form-label">Body</label>
                                <div class="col-8">
                                    <input type="text" class="form-control" placeholder="" v-model="rfq.vehicle.body"
                                           :disabled="true">
                                </div>
                            </div>
                            <div class="form-group row">
                                <label class="col col-form-label">Transmission</label>
                                <div class="col-8">
                                    <select class="form-control" v-model="rfq.vehicle.transmission"
                                            placeholder="Select vehicle transmission" :disabled="true">
                                        <option value="Automatic">Automatic</option>
                                        <option value="Manual">Manual</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group row">
                                <label class="col col-form-label">Odometer</label>
                                <div class="col-8">
                                    <input type="text" class="form-control" placeholder=""
                                           v-model="rfq.vehicle.odometer"
                                           :disabled="true">
                                </div>
                            </div>
                            <div class="form-group row">
                                <label class="col col-form-label">Estimator</label>
                                <div class="col-8">
                                    <input type="text" class="form-control" placeholder=""
                                           v-model="rfq.estimator"
                                           :disabled="true">
                                </div>
                            </div>
                            <div class="form-group row">
                                <label class="col col-form-label">Cutt-Off for Quote</label>
                                <div class="col-8">
                                    <input :value="rfq.cuttOff | formatTimeDate" type="text" class="form-control"
                                           placeholder=""
                                           :disabled="true">
                                </div>
                            </div>

                        </div>
                    </div>
                </tab>
                <tab name="Part List" id="part-list" :class-name="'tab-content-table part-list-tab-supplier'">

                    <div class="row" :class="{'import-dms-additional-block': isSelectedImportDMS}">
                        <template v-if="!isSelectedImportDMS">
                            <div class="col-12 col-lg-5 part-list-qoute-pricing-progress">
                                <quote-pricing-progress
                                        :steps="steps"
                                        :date-due-prop="rfq.dateDue"
                                        :step="currentQPPStep">
                                </quote-pricing-progress>
                            </div>

                            <div class="w-100 d-block d-xl-none"></div>

                            <div class="col-12 col-sm-6 col-lg-4">
                                <rfq-timer :countdown="computedDueDate"
                                           :date-due-prop="rfq.dateDue"
                                           :date-due="rfq.dateDue"
                                           :extensionTimes="rfq.extensionTime">
                                </rfq-timer>
                                <div class="form-group row">
                                    <label class="col col-form-label pl-0 color-lightgray" style="font-size: 1rem;">Comments :</label>
                                    <div class="col-9">
                                <textarea
                                    class="form-control"
                                    placeholder=""
                                    rows="3"
                                    :disabled="true"
                                    v-model="rfq.vehicle.comments">
                                </textarea>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <div v-else-if="isSelectedImportDMS && !isLoading && !isLoadPartsForImporting && !isStartImportingParts"
                             style="text-align: center" class="col-12 col-lg-9 col-lg ml-lg-0 m-lg-0">
                            <p style="padding-top: 15px; font-weight: bold; font-size: 14px">Import DMS Quote PDF</p>
                            <p><strong>Recommendation:</strong> Your Quote Part descriptions and your customers<br/>
                                list order to
                                match. Additional parts, linked or Alternative Names can be<br/> added after import.</p>
                        </div>
                        <div v-else-if="isSelectedImportDMS && isLoading"
                             style="text-align: center; height: 120px; padding-top: 50px;"
                             class="col-12 col-lg-9 col-lg ml-lg-0 m-lg-0">
                            <p style="font-size: 14px; font-weight: bold">Importing and Preparing your Quote</p>
                        </div>
                        <div v-else-if="isSelectedImportDMS && !isLoading && isLoadPartsForImporting && !isStartImportingParts"
                             style="text-align: center; height: 120px; padding-top: 34px;"
                             class="col-12 col-lg-9 col-lg ml-lg-0 m-lg-0">
                            <p style="font-size: 14px; font-weight: bold">Imported Quoted Check</p>
                            <p>Confirm the Quote information below is correct</p>
                        </div>
                        <div v-else-if="isSelectedImportDMS && !isLoading && isLoadPartsForImporting && isStartImportingParts"
                             style="text-align: center; height: 120px; padding-top: 50px;"
                             class="col-12 col-lg-9 col-lg ml-lg-0 m-lg-0">
                            <p style="font-size: 14px; font-weight: bold">Importing Your Quote</p>
                        </div>
                        <div class="col-12 col-lg-3 col-lg ml-lg-0 m-lg-0">
                            <customer-account-deliver
                                    label-business="Customer"
                                    label-address="Deliver To"
                                    :customer="rfq.repairer"
                                    account=""
                                    :delivery-to="deliveryTo"
                                    :estimator="rfq.estimator"
                            ></customer-account-deliver>
                        </div>
                        <div class="wizard__divider"></div>
                    </div>

                    <div v-if="!isSelectedImportDMS"
                         class="d-flex flex-row align-items-center justify-content-between pt-15 px-15 additional-info">
                        <div class="d-flex align-items-center">
                            <vin-date :vin="rfq.vehicle.vin"
                                      :date="rfq.vehicle.dom ? rfq.vehicle.dom : ''"
                                      :hideTrackCode="true"
                                      style="margin-top: 4px;"></vin-date>
                            <template v-if="rfq && rfq.properties && rfq.properties.isAskForPaintCode">
                                <b-form-group label="Paint Code"
                                              label-for="paint-code"
                                              class="m-0 paint-code d-flex align-items-center"
                                              style="padding-top:5px"
                                              label-cols="auto">
                                    <b-form-input ref="paint-code-field"
                                                  id="paint-code"
                                                  :class="{ 'border-for-paint-code': isFlashingPaintCode}"
                                                  style="width: 138px"
                                                  placeholder="Paint Code Req"
                                                  v-model="rfq.paintCodeForRepair"
                                                  @change="updatePaintCodeForRepair()">
                                    </b-form-input>
                                </b-form-group>
                            </template>
                        </div>
                        <div class="d-flex">
                            <b-form-group label="Quote Nbr"
                                          label-for="quote-nbr-field"
                                          class="m-0  quote-nbr d-flex align-items-center"
                                          style="padding-top:5px;"
                                          label-cols="auto">
                              <b-form-input id="quote-nbr-field"
                                            style="width: 138px; margin-right: 10px;"
                                            class="font-13"
                                            :disabled="!(isRFQNew || isRFQPriced)"
                                            v-model="rfq.supplierQuoteNumber"
                                            @change="updateSupplierQuoteNumber()">
                              </b-form-input>
                            </b-form-group>
                            <b-form-group label="Repairer Quote Nbr"
                                          label-for="quote-nbr-field"
                                          class="m-0  quote-nbr d-flex align-items-center"
                                          style="padding-top:5px"
                                          label-cols="auto">
                                <b-form-input id="quote-nbr-field"
                                              style="width: 138px;"
                                              :disabled="true"
                                              class="font-13"
                                              v-model="rfq.repairerQuoteNumber">
                                </b-form-input>
                            </b-form-group>

                        </div>
                    </div>

                    <div v-if="!isSelectedImportDMS" class="d-flex flex-row flex-wrap">
                        <part-list-view
                                ref="partLV"
                                v-if="rfq.id"
                                :rfq="rfq"
                                :importedParts="computedImportedParts"
                                :price-resubmit-flag="priceResubmitActiveFlag"
                                :isRFQNew="isRFQNew"
                                @priced="partListPriced()"
                                @addOptional="addOptional"
                                @setOptionalType="setOptionalType"
                                @resubmitting="priceResubmitActiveFlag = false"
                        >
                        </part-list-view>
                    </div>
                    <RFQImport
                            v-else
                            :vin="rfq.vehicle.vin"
                            :buildDate="rfq.vehicle.dom"
                            :repairer-parts="rfq.parts"
                            @loadParts="isLoadPartsForImporting = true;"
                            @changedLoading="(value) => isLoading = value"
                            @startImporting="(value) => isStartImportingParts = value"
                            @confirmedImport="confirmedImport"
                            @addImportedPdf="addImportedPdf"
                            @addSupplierQuoteNumber = updateSupplierQuoteNumber
                            @closeWizard="isSelectedImportDMS = false;
                                      isLoading = false;
                                      isLoadPartsForImporting = false;
                                      isStartImportingParts = false;">
                    </RFQImport>
                </tab>
                <tab name="Images" id="images" :class-name="'tab-content-table'">

                    <div class="row">
                        <div class="col-12 col-lg-5 part-list-qoute-pricing-progress">
                            <quote-pricing-progress
                                    :steps="steps"
                                    :date-due-prop="rfq.dateDue"
                                    :step="currentQPPStep">
                            </quote-pricing-progress>
                        </div>

                        <div class="w-100 d-block d-xl-none"></div>

                        <div class="col-12 col-sm-6 col-lg-4">
                            <rfq-timer :countdown="computedDueDate"
                                       :date-due-prop="rfq.dateDue"
                                       :date-due="rfq.dateDue"
                                       :extensionTimes="rfq.extensionTime">
                            </rfq-timer>
                            <div class="form-group row">
                                <label class="col col-form-label pl-0 color-lightgray" style="font-size: 1rem;">Comments :</label>
                                <div class="col-9">
                                <textarea
                                    class="form-control"
                                    placeholder=""
                                    rows="3"
                                    :disabled="true"
                                    v-model="rfq.vehicle.comments">
                                </textarea>
                                </div>
                            </div>
                        </div>

                        <div class="col-12 col-sm-6 col-lg ml-lg-0 m-lg-0">
                            <customer-account-deliver
                                    label-business="Customer"
                                    label-address="Deliver To"
                                    :customer="rfq.repairer"
                                    account=""
                                    :delivery-to="deliveryTo"
                                    :estimator="rfq.estimator"
                            ></customer-account-deliver>
                        </div>
                        <div class="wizard__divider"></div>
                    </div>

                    <div class="d-flex flex-row align-items-center justify-content-between pt-15 px-15">
                        <vin-date :vin="rfq.vehicle.vin"
                                  :date="rfq.vehicle.dom ? rfq.vehicle.dom : ''"
                                  :hideTrackCode="true"
                                  class="m-0"></vin-date>
                        <b-form-group label="Repairer Quote Nbr"
                                      style="display: none"
                                      label-for="quote-nbr-field"
                                      class="font-13 m-0"
                                      label-cols="4">
                            <b-form-input id="quote-nbr-field"
                                          class="font-13"
                                          v-model="rfq.repairerQuoteNumber">
                            </b-form-input>
                        </b-form-group>
                    </div>

                    <div class="image-block block p-0">
                        <div class="block-header bg-navyblue">
                            Images
                        </div>
                        <image-lightbox
                                :isRemove="false"
                                :isEdit="false"
                                :isDownload="false"
                                :isPreviewImage="true"
                                :position="''"
                                :imageList="imageSource"
                                :path="''"
                                class="block-body"
                        ></image-lightbox>
                    </div>
                </tab>

                <tab v-if="isOEM && (isRFQWon || isRFQOrdered || isRFQNew || isRFQPriced)" name="Files" id="files"
                     :class-name="'tab-content-table files-tab-supplier'">

                    <div class="row">
                        <div class="col-12 col-lg-5 part-list-qoute-pricing-progress">
                            <quote-pricing-progress
                                    :steps="steps"
                                    :date-due-prop="rfq.dateDue"
                                    :step="currentQPPStep">
                            </quote-pricing-progress>
                        </div>

                        <div class="w-100 d-block d-xl-none"></div>

                        <div class="col-12 col-sm-6 col-lg-4">
                            <rfq-timer :countdown="computedDueDate"
                                       :date-due-prop="rfq.dateDue"
                                       :date-due="rfq.dateDue"
                                       :extensionTimes="rfq.extensionTime">
                            </rfq-timer>
                            <div class="form-group row">
                                <label class="col col-form-label pl-0 color-lightgray" style="font-size: 1rem;">Comments :</label>
                                <div class="col-9">
                                <textarea
                                    class="form-control"
                                    placeholder=""
                                    rows="3"
                                    :disabled="true"
                                    v-model="rfq.vehicle.comments">
                                </textarea>
                                </div>
                            </div>
                        </div>

                        <div class="col-12 col-sm-6 col-lg ml-lg-0 m-lg-0">
                            <customer-account-deliver
                                    label-business="Customer"
                                    label-address="Deliver To"
                                    :customer="rfq.repairer"
                                    account=""
                                    :delivery-to="deliveryTo"
                                    :estimator="rfq.estimator"
                            ></customer-account-deliver>
                        </div>
                        <div class="wizard__divider"></div>
                    </div>

                    <div class="d-flex flex-row align-items-center justify-content-between pt-15 px-15">
                        <vin-date :vin="rfq.vehicle.vin"
                                  :date="rfq.vehicle.dom ? rfq.vehicle.dom : ''"
                                  :hideTrackCode="true"
                                  class="m-0"></vin-date>
                        <b-form-group label="Repairer Quote Nbr"
                                      style="display: none"
                                      label-for="quote-nbr-field"
                                      class="font-13 m-0"
                                      label-cols="4">
                            <b-form-input id="quote-nbr-field"
                                          class="font-13"
                                          v-model="rfq.repairerQuoteNumber">
                            </b-form-input>
                        </b-form-group>
                    </div>

                    <file-upload
                            v-if="rfq.id"
                            :object-id="rfq.id"
                            type="file"
                            :files-accepted="'application/pdf, .doc, .docx, .xml'"
                            :api-urls="{uploadFile: '/ir/supplier/rfq/uploadFile', main: '/ir/supplier/rfq/'}"
                            v-model="rfq.files">
                    </file-upload>

                </tab>

                <template slot="nav-item-right">
                    <div class="tabs-nav-right-btn">
                        <label class="form-check-inline checkbox nav-pin-images">
                            <input class="form-check-input" name="pinimage" v-model="pinImage" type="checkbox">
                            <span class="icon"><i class='bx bx-check'></i></span><span class="text">Pin Images</span>
                        </label>
                    </div>
                    <div class="tabs-nav-right-options">
                        <b-dropdown id="supplier-rfq-view-options" ref="optionMenu" text="Options"
                                    class="dropdown-options">
                            <template v-slot:button-content>Options
                                <span class="dropdown-arrow">
                                    <i class='bx bx-down-arrow'></i>
                                </span>
                            </template>
                            <b-dropdown v-if="rfq.id && isOEM && isRFQNew && rfq.isExtensionTime()" id="dropdown-2"
                                        dropleft
                                        text="Request Time Extension" class="request-time-extension font-12">
                                <template v-slot:button-content>
                                    <i class='bx bx-chevron-left'></i>Request Time Extension
                                </template>
                                <b-dropdown-item @click="setRequestTimeExtension(30)">30 mins</b-dropdown-item>
                                <b-dropdown-item @click="setRequestTimeExtension(60)">1 hour</b-dropdown-item>
                                <b-dropdown-item @click="setRequestTimeExtension(90)">1.5 hours</b-dropdown-item>
                                <b-dropdown-item @click="setRequestTimeExtension(120)">2.0 hours</b-dropdown-item>
                            </b-dropdown>
                            <b-dropdown-item v-if="isCanEditPriceQuote" @click="priceResubmitActiveFlag = true">
                                Edit Priced Quote
                            </b-dropdown-item>
                            <b-dropdown-item v-if="isRFQNew && !isSelectedImportDMS" @click="importQuote"
                                             class="import-dms-option">
                                Import DMS Quote PDF
                            </b-dropdown-item>
                            <b-dropdown-item v-if="isRFQNew && isOEM" @click="sendPartNumbers">Send Part Nbrs/List
                            </b-dropdown-item>
                            <b-dropdown-item v-if="!isRFQWon && !isRFQOrdered && !isRFQClosed" @click="closeQuote">Close
                                Rfq
                            </b-dropdown-item>
                            <b-dropdown-item v-if="isRFQClosed" @click="deleteQuote">Delete Rfq</b-dropdown-item>
                            <b-dropdown-item v-if="isRFQWon" @click="processOrder">Process Order</b-dropdown-item>
                            <b-dropdown-item v-if="isRFQOrdered" @click="viewOrder">View Order</b-dropdown-item>
                            <b-dropdown-item v-if="isEditable" @click="cancelEdit">Cancel Edit</b-dropdown-item>
                        </b-dropdown>
                    </div>

                </template>
            </tabs>
            <transition name="slide-fade">
                <div v-if="isPinImage" class="image-pin-area">
                    <label class="pin-image">
                        <div class="pin-image-label">Pin Images</div>
                        <input type="checkbox" name="pinimage" v-model="pinImage">
                        <span class="pin-checkmark"><i class="fa fa-check"></i></span>
                    </label>
                    <image-lightbox-without-gallery
                            :isRemove="false"
                            :isEdit="false"
                            :isDownload="false"
                            :isPreviewImage="'true'"
                            :position="'pin_images'"
                            :imageList="imageSource"
                            :path="''"
                            @selected="pinClickImage"
                    ></image-lightbox-without-gallery>
                </div>
            </transition>

            <template v-if="shownGallery">
                <image-gallery :use-editor="true"
                               :isDownload="false"
                               :isRemove="false"
                               :images="reversedImageList()"
                               :current-index="galleryCurrentIndex"
                               @close-gallery="onCloseGallery">
                </image-gallery>
            </template>


        </div>
    </div>
</template>

<style lang="scss" scoped>
.supplier-rfq-view-page .part-list-tab-supplier .paint-code {
  margin-left: 50px !important;
}


.w-21 {
  width: 21%;
}

.block-uploader {
  width: 864px;
  margin-top: 15px;
  margin-left: 15px;
}

.image-block {
  width: 864px;
  margin-top: 15px;
  margin-left: 15px;
}


.image-block {
  width: 100%;
  padding: 15px 15px 0 15px;
  margin-left: unset;
  margin-right: unset;
  margin-top: unset;
}

@media screen and (min-width: 993px) {
  .image-block {
    width: 864px;
    padding: unset;
    margin-left: 15px;
    margin-top: 15px;
  }
}

.border-for-paint-code {
  animation-name: flashing;
  animation-timing-function: cubic-bezier(0.03, 0.25, 0.32, 1.28);
  animation-duration: 2s;
  animation-iteration-count: infinite;
}

@keyframes flashing {
  50% {
    box-shadow: inset 0 0px 1px 0px #29bbc1, 0 0 3px 1px #29bbc1;
  }
}

.border-for-paint-code {
  animation-name: flashing;
  animation-timing-function: cubic-bezier(0.03, 0.25, 0.32, 1.28);
  animation-duration: 2s;
  animation-iteration-count: infinite;
}

@keyframes flashing {
  50% {
    box-shadow: inset 0 0px 1px 0px #29bbc1, 0 0 3px 1px #29bbc1;
  }
}

@media (max-width: 768px) {
  .tabs-component .tab-header.float-sm-right div.tabs-nav-right-btn, .tabs-component .tab-header.float-sm-right div.tabs-nav-right-options {
    display: block !important;
  }

  .theme-supplier .dropdown-options {
    width: 90px;
  }

  .theme-supplier .dropdown-options .dropdown-arrow {
    width: 20px;
  }

  .theme-supplier .dropdown-options .dropdown-arrow .bx-down-arrow {
    margin: 10px 10px 10px 5px;
  }

  .supplier-rfq-view-page .tabs-component .tab-header.float-sm-right div.tabs-nav-right-btn {
    display: none !important;
  }
}

.import-dms-additional-block .customer-account-deliver {
  margin: 25px 0 0 0;
}
</style>

<style scoped>
@media screen and (max-width: 576px) {
    .vehicle-details-block {
        width: 100%;
        margin: 15px 0 0 0;
    }

    .V3 .block .block-header,
    .V3 .block .block-body {
        margin: 15px;
    }

    .supplier-rfq-view-page .additional-info {
        flex-direction: column !important;
        width: 100% !important;
        align-items: flex-start !important;
    }
}

@media screen and (max-width: 950px) {
    .block-uploader {
        width: 100% !important;
        margin-left: 0 !important;
    }
}
</style>

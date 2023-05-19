<template>
    <div class="part-list">
        <b-table-simple :sticky-header="true"
                        :class="{'table-width-2':getSuppliersSize()===1, 'table-width-3':getSuppliersSize()===2, 'table-width-4':getSuppliersSize()===3}"
                        hover>
            <b-thead>
                <b-tr>
                    <b-th class="part-list-part-name">
                        Part List
                        <span @click="rfq.sortBy('name')"></span>
                    </b-th>
                    <b-th class="part-list-number text-center">
                        Part Number
                        <span v-if="!isNewStatus" @click="rfq.sortBy('partNumber')"></span>
                    </b-th>
                    <b-th class="part-list-in-stock text-center">
                        <div v-if="!isNewStatus">
                            <p>In Stock</p>
                            <span v-if="!isNewStatus" @click="rfq.sortBy('status')"
                                  style="top: 43px; left: 140px;"></span>
                        </div>
                        <div v-else>
                            <p class="m-0">Stock Status</p>
                            <template>
                                <stock-select
                                        :id="0"
                                        :options="stockOptions"
                                        v-model="stockForAll"
                                        @onSelected="selectedAllStock"
                                        class="stock-select-header"
                                >
                                </stock-select>
                            </template>
                        </div>

                    </b-th>
                    <b-th class="part-list-qty text-center">
                        Qty
                        <span @click="rfq.sortBy('qty')"></span>
                    </b-th>
                    <b-th v-if="isOEM" class="part-list-rrp text-center">
                        List
                        <span @click="rfq.sortBy('rrp')"></span>
                    </b-th>
                    <b-th class="part-list-company text-center">
                        <div class="supplier-icon text-center">
                            <img v-if="1==-1" :src="companyInfo.logoImgPath">
                            <i v-else class='bx bx-car'></i>
                        </div>
                        <div class="supplier-name text-center">
                            {{ companyInfo.businessName }}
                        </div>
                        <div class="supplier-type text-center">
                            {{ rfq.partsType }}
                        </div>
                    </b-th>

                    <!-- Other suppliers block -->
                    <b-th v-for="(supplier) in filterSuppliers()" :key="supplier.id"
                          class="part-list-company-other text-center">
                        <div class="supplier-icon text-center">
                            <img v-if="1==-1" :src="supplier.logo">
                            <i v-else class='bx bx-car'></i>
                        </div>
                        <div class="supplier-name text-center">
                            {{ supplier.name }}
                        </div>
                        <div class="supplier-type text-center">
                            {{ supplier.type }}
                        </div>
                    </b-th>

                    <b-th class="part-list-gst text-center">
                        GST
                        <span @click="rfq.sortBy('gst')"></span>
                    </b-th>
                    <b-th class="part-list-total text-center">
                        Total
                        <span @click="rfq.sortBy('total')"></span>
                    </b-th>
                </b-tr>
            </b-thead>

            <b-tbody>
                <b-tr>
                    <b-td class="subheader subheader-p-l text-right" colspan="1">Pricing Completed</b-td>
                    <b-td class="p-c-value text-left" :colspan="getColspan(7)">
                        {{ rfq.pricingCompletedPercent }}%
                    </b-td>
                </b-tr>
                <b-tr>
                    <b-td class="subheader subheader-p-l bold text-right" colspan="1">Totals</b-td>
                    <b-td class="p-c-value text-center" :colspan="(isOEM)?4:3"></b-td>
                    <b-td class="p-c-value text-center h-totals bold">
                        {{ rfq.total | formatMoney }}
                    </b-td>

                    <!-- Other suppliers block -->

                    <b-td v-for="(supplier) in filterSuppliers()" :key="supplier.id"
                          class="p-c-value text-center h-totals bold">
                        {{ calculateSum(supplier.parts) | formatMoney }}
                    </b-td>
                    <b-td class="subheader subheader-p-l bold" colspan="2"></b-td>
                </b-tr>
            </b-tbody>

            <draggable
                    v-model="parts"
                    class="dragArea"
                    tag="tbody"
                    @change="onPartReorderChange"
                    :move="checkMove"
                    handle=".handle"
                    :scroll-sensitivity="150"
                    :force-fallback="true"
                    :animation="150"
                    :group="{
                       name: 'items',
                       put: true // not allow(false) or allow(true) items to be put into this list
                    }"
                    ghost-class="ghost-items"
                    :disabled="!(isNewStatus || priceResubmitFlag) || isDraggableDisabled"
                    @start="startDraggable"
                    @end="endDraggable"
            >
                <b-tr
                        v-for="(part, key) in orderBy(parts)" :key="part.id"
                        :id="'part-' + part.id"
                        :class="{'part-values': true, 'handle': !part.isOriginalPart && !part.isLinked, 'selected-row': part.isSelected, 'selected-part': selectedPartId === part.id }"
                >
                    <!-- TODO: Recheck on merge into release because this strings can be overwritten -->
                    <b-td class="part-list-part-name"
                          :class="{
                          'td-selected': rfq.isPartSelected(part.originalPartId),
                           'td-add-alt-name p-2': showAltPartNameId===part.id,
                            'td-alt-name': showAltPartNameId!==part.id,
                              'td-optional-part': part.isOptional,
                            }"
                          @contextmenu.prevent.stop="handlePartnameRightClick($event, part, key)">
                        <div class="td-wrapper">
                            <div class="part-list-item-name"
                                 :class="{'has-link': part.isLinkedWithNoCost, 'color-black': rfq.isPartSelected(part.originalPartId)}"
                                 @contextmenu.prevent.stop="handlePartnameRightClick($event, part, key)">
                                <template v-if="part.isManual && isNewStatus">
                                    <div class="d-flex flex-row align-items-center">
                                        <b-input
                                                :ref="'manual-name-' + part.id"
                                                @change="savePart(part)"
                                                @blur="onBlur(part, 'name')"
                                                @mouseover="isDraggableDisabled = true"
                                                @mouseleave="isDraggableDisabled = false"
                                                @dblclick="$event.target.select()"
                                                @focus="onFocus('partName-' + part.id)"
                                                placeholder="Add Part Name"
                                                class="form-control"
                                                type="text"
                                                :disabled="part.isNotApplicable"
                                                @keydown.left="onKeyPressLeft('manual-name-' + part.id, $event)"
                                                @keydown.right="onKeyPressRight('manual-name-' + part.id)"
                                                @keydown.up="onKeyPressUp('manual-name-' + part.id)"
                                                @keydown.down="onKeyPressDown('manual-name-' + part.id)"
                                                v-model="part.name">
                                        </b-input>
                                        <i @click="removePart(part, key)"
                                           @mouseover="isDraggableDisabled = true"
                                           @mouseleave="isDraggableDisabled = false"
                                           class='bx bx-x-circle font-20 mr-2 remove-part ml-2'
                                           v-b-tooltip.hover="{customClass: 'ps-tooltip ps-tooltop--table', html: true, title: 'Remove', placement:'leftbottom'}">
                                        </i>
                                    </div>
                                </template>
                                <template v-else-if="part.isDelivery && isNewStatus">
                                    <div class="d-flex flex-row align-items-center">
                                        <b-input
                                                :ref="'deliveryName-' + part.id"
                                                @keydown.left="onKeyPressLeft('deliveryName-' + part.id, $event)"
                                                @keydown.right="onKeyPressRight('deliveryName-' + part.id)"
                                                @mouseover="isDraggableDisabled = true"
                                                @mouseleave="isDraggableDisabled = false"
                                                @keydown.up="onKeyPressUp('deliveryName-' + part.id)"
                                                @keydown.down="onKeyPressDown('deliveryName-' + part.id)"
                                                @dblclick="$event.target.select()"
                                                @change="savePart(part)"
                                                @blur="onBlur(part, 'deliveryName')"
                                                placeholder="Add Delivery Name"
                                                class="form-control"
                                                type="text"
                                                :disabled="part.isNotApplicable"
                                                v-model="part.deliveryName">
                                        </b-input>

                                        <i @click="removePart(part, key)"
                                           @mouseover="isDraggableDisabled = true"
                                           @mouseleave="isDraggableDisabled = false"
                                           class='bx bx-x-circle font-20 mr-2 remove-part ml-2'
                                           v-b-tooltip.hover="{customClass: 'ps-tooltip ps-tooltop--table', html: true, title: 'Remove', placement:'leftbottom'}">
                                        </i>
                                    </div>
                                </template>
                                <template v-else-if="part.isOptional">
                                    <span v-if="!part.isRemovedByRepairer" class="d-block">
                                  {{ part.name }}
                                </span>
                                    <span v-else class="d-block" style="color: #afafaf">
                                  {{ part.name }}
                                  (Removed By Repairer)
                                </span>
                                    <b-form-invalid-feedback :state="checkName(part.name)" class="m-0 font-12"
                                                             v-if="enableOptionalCheck">
                                        <span>Part type has not been set</span>
                                    </b-form-invalid-feedback>
                                </template>
                                <template v-else>
                                    <!-- <div> -->
                                    <span v-if="!part.isRemovedByRepairer" class="d-block">
                                    {{ (part.isDelivery) ? part.deliveryName : part.name }}
                                  </span>
                                    <span v-else class="d-block" style="color: #afafaf">
                                    {{ (part.isDelivery) ? part.deliveryName : part.name }}
                                    (Removed By Repairer)
                                  </span>
                                    <b-form-invalid-feedback :state="checkName(part.name)" class="m-0 font-12"
                                                             v-if="part.isOptional && enableOptionalCheck">
                                        <span>Part type has not been set</span>
                                    </b-form-invalid-feedback>
                                    <template v-if="showAltPartNameId===part.id">
                                        <div class="d-flex flex-row justify-content-start align-items-center">
                                            <b-input
                                                    :ref="'altPartName-' + part.id"
                                                    @change="savePart(part)"
                                                    @blur="onBlur(part, 'altPartName')"
                                                    @mouseover="isDraggableDisabled = true"
                                                    @mouseleave="isDraggableDisabled = false"
                                                    @dblclick="$event.target.select()"
                                                    @focus="onFocus('altPartName-' + part.id)"
                                                    placeholder="Add Part Name" class="w-90" type="text"
                                                    :disabled="part.isNotApplicable"
                                                    v-model="part.altPartName"></b-input>
                                            <div class="ml-2">
                                                <i class='bx bx-x-circle  mr-2 remove-part'
                                                   v-b-tooltip.hover="{customClass: 'ps-tooltip ps-tooltop--table', html: true, title: 'Remove', placement:'leftbottom'}"
                                                   @click="showAltPartNameId=0; part.altPartName=''; savePart(part)"></i>
                                            </div>
                                        </div>
                                    </template>
                                    <template v-else>
                                        <div class="d-block div-add-alt-name">
                                            {{ part.altPartName }}
                                        </div>
                                    </template>
                                    <!-- </div> -->
                                </template>
                            </div>

                            <!-- icons -->
                            <div class="part-list-part-name__icon-group">
                                <i v-if="part.isLinked"
                                   class='bx bx-link part-list-part-name__icon'
                                   v-b-tooltip.hover="{customClass: 'ps-tooltip', html: true, title:`Linked to <br>${linkedTo(part)}`, placement:'leftbottom'}"></i>
                                <i v-if="part.stockComment"
                                   v-b-tooltip.hover="{customClass: 'ps-tooltip', html: true, title: part.stockComment, placement:'leftbottom'}"
                                   class='bx bx-note part-list-part-name__icon part-list-part-name__icon--comment text-warning'></i>
                                <i v-if="rfq.isPartSelected(part.originalPartId)"
                                   v-b-tooltip.hover="{customClass: 'ps-tooltip', html: true, title:'Part Ordered', placement:'leftbottom'}"
                                   class='bx bxs-check-circle check-icon float-right position-relative'></i>
                                <i v-else-if="isWonStatus || isOrderedStatus"
                                   v-b-tooltip.hover="{customClass: 'ps-tooltip', html: true, title:'Part not Ordered', placement:'leftbottom'}"
                                   class='bx bxs-minus-circle check-icon float-right position-relative'></i>
                            </div>
                        </div>
                    </b-td>

                    <b-td class="part-list-number text-center p-2">
                        <div :class="{'color-black': rfq.isPartSelected(part.originalPartId)}"
                             class="part-list-item-number">
                            <template v-if="isNewStatus || priceResubmitFlag">
                                <b-input
                                        :ref="'part-number-' + part.id"
                                        :disabled="part.isNotApplicable"
                                        v-if="part.isDelivery"
                                        @dblclick="$event.target.select()"
                                        @mouseover="isDraggableDisabled = true"
                                        @mouseleave="isDraggableDisabled = false"
                                        @change="onChange(part)"
                                        @blur="onBlur(part, 'deliveryZone')"
                                        @focus="onFocus('name-' + part.id)"
                                        type="text"
                                        @keydown.left="onKeyPressLeft('part-number-' + part.id, $event)"
                                        @keydown.right="onKeyPressRight('part-number-' + part.id)"
                                        @keydown.up="onKeyPressUp('part-number-' + part.id)"
                                        @keydown.down="onKeyPressDown('part-number-' + part.id)"
                                        v-model="part.deliveryZone">
                                </b-input>
                                <b-input
                                        :ref="'part-number-' + part.id"
                                        :disabled="part.isNotApplicable"
                                        v-else
                                        @change="onChange(part)"
                                        @dblclick="$event.target.select()"
                                        @mouseover="isDraggableDisabled = true"
                                        @mouseleave="isDraggableDisabled = false"
                                        @blur="onBlur(part, 'number')"
                                        @focus="onFocus('name-' + part.id)"
                                        type="text"
                                        @keydown.left="onKeyPressLeft('part-number-' + part.id, $event)"
                                        @keydown.right="onKeyPressRight('part-number-' + part.id)"
                                        @keydown.up="onKeyPressUp('part-number-' + part.id)"
                                        @keydown.down="onKeyPressDown('part-number-' + part.id)"
                                        v-model="part.number">
                                </b-input>
                            </template>
                            <template v-else>
                                {{ (part.isDelivery) ? part.deliveryZone : part.number }}
                            </template>
                        </div>
                    </b-td>

                    <b-td class="part-list-in-stock text-center p-2"
                          :class="{'td-selected': rfq.isPartSelected(part.originalPartId)}">
                        <div class="part-list-item-in-stock">
                            <template v-if="(part.isLinked && part.isLinkedWithNoCost) || part.isDelivery">
                                <div></div>
                            </template>
                            <template
                                    v-else-if="isNewStatus || priceResubmitFlag">
                                <stock-select
                                        :id="part.id"
                                        :options="stockOptions"
                                        @mouseover="isDraggableDisabled = true"
                                        @mouseleave="isDraggableDisabled = false"
                                        v-model="part.selectedOption"
                                        @onSelected="selectStockStatus($event, key)"
                                        @onKeyPressRight="onKeyPressRight('stock-select-' + part.id)"
                                        @onKeyPressLeft="onKeyPressLeft('stock-select-' + part.id, $event)"
                                        :ref="'stock-select-' + part.id"
                                        :is-disabled="part.isNotApplicable"
                                        @blur="onBlur(part, 'selectedOption')"
                                        @focus="onFocus('stock-select-' + part.id)"
                                >
                                </stock-select>
                            </template>
                            <template v-else>
                                {{ part.selectedOption.label }}
                            </template>
                        </div>
                    </b-td>

                    <b-td class="part-list-qty text-center"
                          :class="{'td-selected': rfq.isPartSelected(part.originalPartId)}">
                        <template v-if="(part.isLinked && part.isLinkedWithNoCost)  || part.isDelivery">
                            <div></div>
                        </template>
                        <template v-else-if="part.isOptional || part.id">
                            <div class="part-list-item-qty p-0">
                                <span v-if="part.isNotApplicable"></span>
                                <numeral
                                        :ref="'qty-' + part.id"
                                        v-else-if="isRFQNew || priceResubmitFlag"
                                        @change="onChange(part)"
                                        @blur="onBlur(part, 'qty')"
                                        @focus="onFocus('qty-' + part.id)"
                                        format="0,0"
                                        class="w-100 form-control float-right"
                                        :isDisabled="part.isNotApplicable"
                                        @mouseover="isDraggableDisabled = true"
                                        @mouseleave="isDraggableDisabled = false"
                                        @onKeyPressRight="event => onKeyPressRight('qty-' + part.id, event)"
                                        @onKeyPressLeft="event => onKeyPressLeft('qty-' + part.id, event)"
                                        @onKeyPressUp="onKeyPressUp('qty-' + part.id)"
                                        @onKeyPressDown="onKeyPressDown('qty-' + part.id)"
                                        style="width: 44px !important; text-align: center; padding: 0.375rem 0rem;"
                                        v-model="part.qty">
                                </numeral>
                                <div class="d-flex" v-else>
                                    <span>{{ part.qty }}</span>
                                    <i v-if="part.originalQty - part.qty < 0"
                                       style="transform: translateY(0px)"
                                       v-b-tooltip.hover="{customClass: 'ps-tooltip ps-tooltop--table qty-tooltip', html: true, title: 'Qty Changed', placement:'leftbottom'}"
                                       class="bx bx-up-arrow-alt qty-icon-arrow-up qty-icon-arrow">
                                    </i>
                                    <i v-else-if="part.originalQty - part.qty > 0"
                                       style="transform: translateY(0px)"
                                       v-b-tooltip.hover="{customClass: 'ps-tooltip ps-tooltop--table qty-tooltip', html: true, title: 'Qty Changed', placement:'leftbottom'}"
                                       class="bx bx-down-arrow-alt qty-icon-arrow-down qty-icon-arrow">
                                    </i>
                                </div>
                            </div>
                        </template>
                        <template v-else>
                            <b-input
                                    :ref="'qty-' + part.id"
                                    @change="savePart(part)"
                                    type="number"
                                    min='1'
                                    step="1"
                                    @blur="onBlur(part, 'qty')"
                                    @focus="onFocus('qty-' + part.id)"
                                    @mouseover="isDraggableDisabled = true"
                                    @mouseleave="isDraggableDisabled = false"
                                    @keydown.left="event => onKeyPressLeft('qty-' + part.id, event)"
                                    @keydown.right="event => onKeyPressRight('qty-' + part.id, event)"
                                    @keydown.up="onKeyPressUp('qty-' + part.id)"
                                    @keydown.down="onKeyPressDown('qty-' + part.id)"
                                    :disabled="part.isNotApplicable"
                                    :isDisabled="part.isNotApplicable"
                                    v-model="rfq.qty">
                            </b-input>
                        </template>
                    </b-td>

                    <b-td v-if="isOEM" class="part-list-rrp text-center p-2"
                          :class="{'td-selected': rfq.isPartSelected(part.originalPartId)}">
                        <div class="part-list-item-rrp"
                             :class="{'green-cell': (part.firstRrp > 0 && part.firstRrp<Number(part.rrp)), 'red-cell':(part.firstRrp > 0 && part.firstRrp>Number(part.rrp))}">
                            <template v-if="(part.isLinked && part.isLinkedWithNoCost)  || part.isDelivery">
                                <div></div>
                            </template>
                            <template
                                    v-else-if="isNewStatus || priceResubmitFlag">
                                <numeral
                                        :ref="'rrp-' + part.id"
                                        v-if="!part.isNotApplicable"
                                        @change="onChange(part)"
                                        @blur="onBlur(part, 'rrp')"
                                        @focus="onFocus('rrp-' + part.id)"
                                        @mouseover="isDraggableDisabled = true"
                                        @mouseleave="isDraggableDisabled = false"
                                        @onKeyPressRight="event => onKeyPressRight('rrp-' + part.id, event)"
                                        @onKeyPressLeft="event => onKeyPressLeft('rrp-' + part.id, event)"
                                        @onKeyPressUp="onKeyPressUp('rrp-' + part.id)"
                                        @onKeyPressDown="onKeyPressDown('rrp-' + part.id)"
                                        format="$0.00"
                                        class="w-100 form-control float-right"
                                        :class="{'green-cell': (part.firstRrp > 0 && part.firstRrp<Number(part.rrp)), 'red-cell':(part.firstRrp > 0 && part.firstRrp>Number(part.rrp))}"
                                        :isDisabled="part.isNotApplicable"
                                        v-model="part.rrp">
                                </numeral>
                                <div v-else class="form-control" style="height: 32px;"></div>
                            </template>
                            <template v-else>
                                {{ part.rrp | formatMoney }}
                            </template>
                        </div>
                    </b-td>

                    <b-td class="part-list-company-price text-center p-2"
                          :class="{'td-selected': rfq.isPartSelected(part.originalPartId)}">
                        <div class="part-list-item-company-price"
                             :class="{'green-cell': (part.firstPrice > 0 && part.firstPrice<part.price), 'red-cell':(part.firstPrice > 0 && part.firstPrice>part.price)}">
                            <template v-if="(part.isLinked && part.isLinkedWithNoCost) ">
                                <div></div>
                            </template>
                            <template v-else-if="isNewStatus || priceResubmitFlag">
                                <numeral
                                        :ref="'price-' + part.id"
                                        v-if="!part.isNotApplicable"
                                        @change="onChange(part)"
                                        @blur="onBlur(part, 'price')"
                                        @focus="onFocus('price-' + part.id)"
                                        @mouseover="isDraggableDisabled = true"
                                        @mouseleave="isDraggableDisabled = false"
                                        @onKeyPressRight="event => onKeyPressRight('price-' + part.id, event)"
                                        @onKeyPressLeft="event => onKeyPressLeft('price-' + part.id, event)"
                                        @onKeyPressUp="onKeyPressUp('price-' + part.id)"
                                        @onKeyPressDown="onKeyPressDown('price-' + part.id)"
                                        format="$0.00"
                                        class="w-100 form-control"
                                        :class="{'green-cell': (part.firstPrice > 0 && part.firstPrice<part.price), 'red-cell':(part.firstPrice > 0 && part.firstPrice>part.price)}"
                                        :isDisabled="part.isNotApplicable"
                                        v-model="part.price">
                                </numeral>
                                <div v-else class="form-control" style="height: 32px;"></div>
                            </template>
                            <template v-else>
                                {{ part.price | formatMoney }}
                            </template>
                        </div>
                    </b-td>

                    <!-- Other suppliers block -->
                    <b-td v-for="(supplier) in filterSuppliers()" :key="supplier.id"
                          class="part-list-company-price-other text-center p-2">
                        <div class="part-list-item-company-price-other">
                            <template v-for="sPrice in supplier.parts">
                                <template
                                        v-if="part.originalPartId && Number(sPrice.originalPartId) === Number(part.originalPartId)">
                                    <template v-if="sPrice.price">
                                        {{ sPrice.price | formatMoney }}
                                    </template>
                                    <template v-else>
                                        To be Priced
                                    </template>
                                </template>
                            </template>
                        </div>
                    </b-td>

                    <!-- GST column -->
                    <b-td class="part-list-gst text-center p-2"
                          :class="{'td-selected': rfq.isPartSelected(part.originalPartId)}">
                        <div class="part-list-item-gst" v-if="part.isLinkedWithNoCost || part.isDelivery"></div>
                        <div class="part-list-item-gst" v-else>{{ part.gst | formatMoney }}</div>
                    </b-td>

                    <!-- Total column -->
                    <b-td class="part-list-total text-center p-2"
                          :class="{'td-selected': rfq.isPartSelected(part.originalPartId)}">
                        <div class="part-list-item-total" v-if="part.isLinkedWithNoCost || part.isDelivery"></div>
                        <div class="part-list-item-total" v-else>{{ part.total | formatMoney }}</div>
                    </b-td>
                </b-tr>
            </draggable>

            <b-tbody class="position-relative">
                <b-tr v-if="isNewStatus">
                    <b-td class="subheader subheader-p-l" style="opacity:1" :colspan="getColspan(8)">
                        <a href="#" @click.prevent="addNewPart('manual')" class="add-part">
                            <i class='bx bx-plus'></i>
                            <span>Add Part</span>
                        </a>
                    </b-td>
                </b-tr>
                <b-tr v-if="isNewStatus">
                    <b-td class="subheader subheader-p-l" style="opacity:1" :colspan="getColspan(8)">
                        <a href="#" @click.prevent="addNewPart('delivery')" class="add-part">
                            <i class='bx bx-plus'></i>
                            <span>Add Freight</span>
                        </a>
                    </b-td>
                </b-tr>
                <b-tr v-if="priceResubmitFlag">
                    <b-td colspan="5"></b-td>
                    <b-td style="text-align: center">
                        <button :disabled="isDisabledSave" @click="savePrices(true)" class="btn btn-primary">Save
                        </button>
                    </b-td>
                    <b-td :colspan="getColspan(2)"></b-td>
                </b-tr>
                <b-tr>
                    <b-td class="subheader subheader-p-l text-right" colspan="1">Parts in Stock Today</b-td>
                    <b-td class="p-c-value text-left" :colspan="getColspan(7)" style="padding-left:20px;">
                        <span style="margin-right: 30px;">{{ rfq.partsInStock }} %</span>
                        <span>{{ rfq.partsInStockWithOutPercents }}</span>
                    </b-td>
                </b-tr>
                <b-tr>
                    <b-td class="subheader subheader-p-l text-right" colspan="1">Parts Delivery ETA</b-td>
                    <b-td class="p-c-value text-left center" :colspan="getColspan(7)">
                        <template v-if="isNewStatus">
                            <div class="datetime-field-value time-input input-group date">
                                <i class='bx bx-calendar-week input-group-addon'></i>
                                <date-picker v-model="rfq.partsDeliveryETA" @onChange="savePrices"></date-picker>
                            </div>
                        </template>
                        <template v-else>
                            <span style="padding-left:5px;">{{ rfq.partsDeliveryETA }}</span>
                        </template>
                    </b-td>
                </b-tr>
                <b-tr>
                    <b-td class="subheader  subheader-p-l-b text-right" :colspan="getColspan()">Subtotal</b-td>
                    <b-td v-if="isWonStatus || isOrderedStatus" class="p-c-value b-value text-center font-weight-bold"
                          colspan="2">
                        {{ rfq.order.subtotal | formatMoney }}
                    </b-td>
                    <b-td v-else class="p-c-value b-value text-center font-weight-bold" colspan="2">
                        {{ rfq.subtotal | formatMoney }}
                    </b-td>
                </b-tr>
                <b-tr>
                    <b-td class="subheader subheader-p-l-b text-right" :colspan="getColspan()">GST</b-td>
                    <b-td v-if="isWonStatus || isOrderedStatus" class="p-c-value b-value text-center font-weight-bold"
                          colspan="2">
                        {{ rfq.order.gst | formatMoney }}
                    </b-td>
                    <b-td v-else class="p-c-value b-value text-center font-weight-bold" colspan="2">
                        {{ rfq.gst | formatMoney }}
                    </b-td>
                </b-tr>
                <b-tr>
                    <b-td class="subheader subheader-p-l-b text-right" :colspan="getColspan()">Grand Total</b-td>
                    <b-td v-if="isWonStatus || isOrderedStatus" class="p-c-value b-value text-center font-weight-bold"
                          colspan="2">
                        {{ Number(rfq.order.subtotal) + Number(rfq.order.gst) | formatMoney }}
                    </b-td>
                    <b-td v-else class="p-c-value b-value text-center font-weight-bold" colspan="2">
                        {{ rfq.subtotal + rfq.gst | formatMoney }}
                    </b-td>
                </b-tr>
                <b-tr v-if="isNewStatus">
                    <b-td class="subheader subheader-p-l-b text-right" :colspan="getColspan()">Submit Pricing</b-td>
                    <b-td class="p-c-value b-value text-center" colspan="2">
                        <button class="btn btn-primary" @click="sendPrices()">Submit Pricing</button>
                    </b-td>
                </b-tr>
                <b-tr>
                    <b-td class="subheader subheader-p-l-b text-right" :colspan="getColspan()">Customer Rewards</b-td>
                    <b-td class="p-c-value b-value text-center part-values" colspan="2">
                        -
                    </b-td>
                </b-tr>
            </b-tbody>
        </b-table-simple>

        <vue-context
                ref="menuPartName"
                class="context-menu-right-click"
                @open="handleContextOpen"
                @close="closeContextMenu"
                :closeOnClick="false"
                :subMenuOffset="100"
        >
            <template slot-scope="item">
                <!-- bind :menu prop for part-name-menu -->
                <part-name-menu
                        v-if="item.data"
                        @select="handlePartnameSelected"
                        :currentPart="item.data"
                        :is-oem="isOEM"
                        :supplier-type="companyInfo.supplierType"
                        :parts="partsForContext">
                </part-name-menu>
            </template>

        </vue-context>
    </div>
</template>

<script>
/*eslint-disable */
import { mapGetters } from 'vuex'
import Axios from 'axios'
import { States } from '../../../../store/states'
import Numeral from '../../../../components/utility/number-formatter'
import StockSelect from '../../../../components/StockSelect'
import { VueContext } from 'vue-context'
import partNameMenu from './part-name-menu'
import draggable from 'vuedraggable'
import _ from 'lodash'
import Part from '@/components/rfq/models/Part'
import DatePicker from '@/components/datePicker'
import Multiselect from 'vue-multiselect'

export default {
  name: 'SupplierPartList',
  data: function () {
    return {
      isDraggabling: false,
      selectedPartIndex: null,
      isDisabledSave: true,
      stockOptions: States.stockOptions,
      stockForAll: { 'label': 'Select All', 'textValue': 'selectAll', 'value': -1, 'comment': '' },
      headerStockOptions: ['None', 'In Stock'],
      isLoading: false,
      showAltPartNameId: 0,
      enableOptionalCheck: false,
      lastManualPartId: null,
      parts: [],
      originalParts: [],
      isDraggableDisabled: false,
      focusedElement: '',
      selectedPartId: null,
    }
  },
  props: {
    rfq: {
      type: Object,
      required: true
    },
    priceResubmitFlag: {
      type: Boolean,
      default: false,
    },
    isRFQNew: {
      type: Boolean,
      default: false,
    },
    importedParts: {
      type: Array,
      default: () => ([]),
    }
  },
  computed: {
    ...mapGetters({
      companyInfo: 'currentCompany/getDetails',
      isOEM: 'currentCompany/isOEM',
    }),
    partsForContext () {
      let parts = _.filter(this.parts, (prt) => {
        return Number(prt.id) !== Number(this.selectedPartId)
      })
      _.forEach(parts, (prt) => {
        prt.isHasLinked = false
        let linkedPrt = _.find(parts, (p) => {
          return Number(prt.id) === Number(p.linkId)
        })
        if (linkedPrt) {
          prt.isHasLinked = true
        }
      })
      return parts
    },
    computedAvailableRefs () {
      let result = []
      _.forEach(this.parts, (part) => {
        let cells = ['manual-name-' + part.id, 'part-number-' + part.id, 'stock-select-' + part.id, 'qty-' + part.id, 'rrp-' + part.id, 'price-' + part.id]
        if (part.isDelivery) {
          cells[0] = 'deliveryName-' + part.id
        }
        result.push(cells)
      })
      return result
    },
    isNewStatus () {
      return this.rfq.status === 'New'
    },
    isWonStatus () {
      return this.rfq.status === 'Won'
    },
    isOrderedStatus () {
      return this.rfq.status === 'Ordered'
    },
  },
  watch: {
    'rfq.parts': {
      handler (val) {
        if (this.isDraggabling) {
          console.log('rfq.parts.update - cancel')
          return
        }
        this.originalParts = val
        _.forEach(val, (part) => {
          let originalPart = _.find(this.parts, (prt) => {
            return Number(prt.id) === Number(part.id)
          })
          if (originalPart) {
            // console.log('rfq.parts.listOrderNumber', part.id, part.listOrderNumber, originalPart.listOrderNumber)
          } else {
            // console.log('rfq.parts.listOrderNumber.NoOriginalPart', part.id)
          }
          if (this.isInFocusElement('qty-' + part.id)) {
            part.qty = originalPart.qty
          }
          if (this.isInFocusElement('partName-' + part.id)) {
            part.name = originalPart.name
          }
          if (this.isInFocusElement('deliveryName-' + part.id)) {
            part.deliveryName = originalPart.deliveryName
          }
          if (this.isInFocusElement('altPartName-' + part.id)) {
            part.altPartName = originalPart.altPartName
          }
          if (this.isInFocusElement('name-' + part.id)) {
            if (part.isDelivery) {
              part.deliveryZone = originalPart.deliveryZone
            } else {
              part.number = originalPart.number
            }
          }
          if (this.isInFocusElement('stock-select-' + part.id)) {
            part.selectedOption = originalPart.selectedOption
          }
          if (this.isInFocusElement('rrp-' + part.id)) {
            part.rrp = originalPart.rrp
          }
          if (this.isInFocusElement('price-' + part.id)) {
            part.price = originalPart.price
          }

        })
        this.parts = val
      },
      immediate: true
    },
    importedParts: {
      handler (val) {
        console.log(val, 'value')
        this.addImportedParts(val)
      },
      immediate: true,
    },
  },
  methods: {
    markAsDelivery (prt) {
      prt.type = 'delivery'
      prt.deliveryName = prt.altPartName || prt.name
      prt.deliveryZone = prt.partNumber
      this.savePart(prt)
    },
    orderBy (prts) {
      return _.orderBy(prts, [(itm) => Number(itm.listOrderNumber), (itm) => Number(itm.id)])
    },
    focusElement (ref) {
      if (this.$refs[ref] && this.$refs[ref][0]) {
        this.$refs[ref][0].focus()
      }
    },
    checkMove (q) {
      if (q.related && q.related.id && q.related.id.split('-').length === 2) {
        let id = q.related.id.split('-')[1]
        let part = _.find(this.parts, (prt) => {
          return Number(prt.id) === Number(id)
        })
        let index = this.parts.indexOf(part)
        if ((part && part.linkId > 0) || (this.parts[index + 1] && this.parts[index + 1].linkId > 0 && q.willInsertAfter)) {
          return false
        }
      }
    },
    startDraggable (e) {
      this.isDraggabling = true
      console.log('startDraggable', e)
    },
    endDraggable (e) {
      this.isDraggabling = false
      console.log('endDraggable', e)
    },
    selectedAllStock (value) {
      _.forEach(this.parts, (prt) => {
        if (!prt.isHighlight) {
          prt.stock = value.value
          prt.stockComment = value.comment
        }
      })
      this.savePrices()
    },
    onFocus (ref) {
      this.isDraggableDisabled = true
      this.focusedElement = ref
    },
    isInFocusElement (ref) {
      if (ref === this.focusedElement) {
        return true
      }
      return false
    },
    onBlur (part, field) {
      this.isDraggableDisabled = false
      let updatedPart = _.find(this.originalParts, prt => {
        return Number(prt.id) === Number(part.id)
      })
      if (updatedPart) {
        if (field === 'selectedOption') {
          if (!_.isEqual(updatedPart[field], part[field])) {
            this.savePart(part)
          }
        } else if (updatedPart[field] !== part[field]) {
          this.savePart(part)
        }
      }
      this.focusedElement = ''
    },
    onKeyPressUp (ref) {
      console.log('up', ref)
      let indexOfCurrentRow = _.findIndex(this.computedAvailableRefs, (row) => {
        return row.includes(ref)
      })
      let indexOfCurrentElement = _.findIndex(this.computedAvailableRefs[indexOfCurrentRow], (r) => {
        return r === ref
      })
      let resultRef = null
      if (indexOfCurrentRow === 0) {
        resultRef = this.computedAvailableRefs[this.computedAvailableRefs.length - 1][indexOfCurrentElement]
      } else {
        resultRef = this.computedAvailableRefs[indexOfCurrentRow - 1][indexOfCurrentElement]
      }
      if (!this.$refs[resultRef] || !this.$refs[resultRef][0] || this.$refs[resultRef][0].isDisabled || this.$refs[resultRef][0].disabled) {
        this.onKeyPressUp(resultRef)
        return
      }
      this.$refs[resultRef][0].focus()
    },
    onKeyPressDown (ref) {
      console.log('down')
      let indexOfCurrentRow = _.findIndex(this.computedAvailableRefs, (row) => {
        return row.includes(ref)
      })
      let indexOfCurrentElement = _.findIndex(this.computedAvailableRefs[indexOfCurrentRow], (r) => {
        return r === ref
      })
      let resultRef = null
      if (indexOfCurrentRow + 1 === this.computedAvailableRefs.length) {
        resultRef = this.computedAvailableRefs[0][indexOfCurrentElement]
      } else {
        resultRef = this.computedAvailableRefs[indexOfCurrentRow + 1][indexOfCurrentElement]
      }
      if (!this.$refs[resultRef] || !this.$refs[resultRef][0] || this.$refs[resultRef][0].isDisabled || this.$refs[resultRef][0].disabled) {
        this.onKeyPressDown(resultRef)
        return
      }
      this.$refs[resultRef][0].focus()
    },
    onKeyPressLeft (ref, e) {
      if (e) {
        var elem = e.srcElement
        let pos = this.getCaretPosition(elem)
        if (pos > 0) {
          return
        }
      }
      let indexOfCurrentRow = _.findIndex(this.computedAvailableRefs, (row) => {
        return row.includes(ref)
      })
      let indexOfCurrentElement = _.findIndex(this.computedAvailableRefs[indexOfCurrentRow], (r) => {
        return r === ref
      })
      let resultRef = null
      if (indexOfCurrentElement === 0) {
        let resultRow = []
        if (indexOfCurrentRow === 0) {
          resultRow = this.computedAvailableRefs[this.computedAvailableRefs.length - 1]
        } else {
          resultRow = this.computedAvailableRefs[indexOfCurrentRow - 1]
        }
        let resultRowLastIndex = resultRow.length - 1
        resultRef = resultRow[resultRowLastIndex]
        if (!this.$refs[resultRef] || !this.$refs[resultRef][0] || this.$refs[resultRef][0].isDisabled || this.$refs[resultRef][0].disabled) {
          this.onKeyPressLeft(resultRef)
          return
        }
      } else {
        resultRef = this.computedAvailableRefs[indexOfCurrentRow][indexOfCurrentElement - 1]
        if (!this.$refs[resultRef] || !this.$refs[resultRef][0] || this.$refs[resultRef][0].isDisabled || this.$refs[resultRef][0].disabled) {
          this.onKeyPressLeft(resultRef)
          return
        }
      }
      if (resultRef.includes('stock-select')) {
        this.$refs[resultRef][0].focusOnInput()
      } else {
        this.$refs[resultRef][0].focus()
      }
    },
    onKeyPressRight (ref, e) {
      if (e) {
        var elem = e.srcElement
        let pos = this.getCaretPosition(elem)
        if (pos < elem.value.length) {
          return false
        }
      }
      let indexOfCurrentRow = _.findIndex(this.computedAvailableRefs, (row) => {
        return row.includes(ref)
      })
      let indexOfCurrentElement = _.findIndex(this.computedAvailableRefs[indexOfCurrentRow], (r) => {
        return r === ref
      })
      let resultRef = null

      if (indexOfCurrentElement === this.computedAvailableRefs[indexOfCurrentRow].length - 1) {
        if (indexOfCurrentRow === this.computedAvailableRefs.length - 1) {
          resultRef = this.computedAvailableRefs[0][0]
        } else {
          resultRef = this.computedAvailableRefs[indexOfCurrentRow + 1][0]
        }
        if (!this.$refs[resultRef] || !this.$refs[resultRef][0] || this.$refs[resultRef][0].isDisabled || this.$refs[resultRef][0].disabled) {
          this.onKeyPressRight(resultRef)
          return
        }
      } else {
        resultRef = this.computedAvailableRefs[indexOfCurrentRow][indexOfCurrentElement + 1]
        if (!this.$refs[resultRef] || !this.$refs[resultRef][0] || this.$refs[resultRef][0].isDisabled || this.$refs[resultRef][0].disabled) {
          this.onKeyPressRight(resultRef)
          return
        }
      }
      if (resultRef.includes('stock-select')) {
        this.$refs[resultRef][0].focusOnInput()
      } else {
        this.$refs[resultRef][0].focus()
      }
    },
    getCaretPosition: function (ctrl) {
      // IE < 9 Support
      if (document.selection) {
        ctrl.focus()
        var range = document.selection.createRange()
        var rangelen = range.text.length
        range.moveStart('character', -ctrl.value.length)
        var start = range.text.length - rangelen
        return start
      }
      // IE >=9 and other browsers
      else if (ctrl.selectionStart || ctrl.selectionStart == '0') {
        return ctrl.selectionEnd
      } else {
        return 0
      }
    },
    addImportedParts (data) {
      if (_.isEmpty(data)) {
        return
      }
      let newData = []
      _.forEach(data, (item, index) => {
        if (!item.id) {
          Axios.post('/ir/supplier/rfq/' + this.rfq.id, {
            addPart: true
          }).then(response => {
            if (response.data.status && response.data.manualPartId && Number(response.data.manualPartId) > 0) {
              let prt = {
                comment: 0,
                id: response.data.manualPartId,
                price: 0,
                status: 0,
                qty: 1,
                number: '',
                rrp: 0,
                name: item.name,
                gstTax: 10,
                type: 'manual',
                listOrderNumber: 999,
              }
              let repairerName = item.repairerName

              let newPart = new Part(prt)
              newPart.number = item.number
              newPart.qty = item.qty
              newPart.rrp = item.rrp
              newPart.price = item.price
              newPart.listOrderNumber = item.listOrderNumber
              newPart.name = item.name ? item.name : item.repairerName
              if (newPart.name === 'Not Applicable') {
                newPart.name = repairerName
                newPart.partNumber = 'NOT APPLICABLE'
                newPart.stock = 3
                newPart.stockComment = 'NOT APPLICABLE'
                newPart.isNotApplicable = true
              }
              if (index === 0) {
                newData.unshift(newPart)
              } else {
                newData = _.concat(newData.slice(0, index), newPart, newData.slice(index))
              }
            }
          }).catch(error => {
            console.log(error)
          }).finally(() => {})

        } else {
          let originalPart = _.find(this.rfq.parts.slice(), (prt) => {
            return Number(prt.id) === Number(item.id)
          })
          originalPart.listOrderNumber = index
          originalPart.qty = item.qty
          originalPart.rrp = item.rrp
          originalPart.price = item.price
          if (item.repairerName !== item.name && item.name !== 'Not Applicable') {
            originalPart.altPartName = item.name
            originalPart.partNumber = item.number
            originalPart.name = item.repairerName
            if (originalPart.isNotApplicable) {
              originalPart.isNotApplicable = false
              originalPart.stockComment = ''
              originalPart.stock = 0
            }
          }
          if (item.name === 'Not Applicable') {
            originalPart.name = item.repairerName
            originalPart.partNumber = 'NOT APPLICABLE'
            originalPart.stock = 3
            originalPart.stockComment = 'NOT APPLICABLE'
            originalPart.isNotApplicable = true
          }
          newData.push(originalPart)
        }

        if (index === data.length - 1) {
          let interval = setInterval(() => {
            if (newData.length === data.length) {
              newData = _.orderBy(newData, [(itm) => Number(itm.listOrderNumber), (itm) => Number(itm.id)])
              this.$set(this.rfq, 'parts', newData)
              setTimeout(() => {
                this.savePrices()
              }, 500)
              clearInterval(interval)
            }
          }, 10)

        }
      })
    },
    linkedTo (part) {
      if (!part.isLinked) {
        return ''
      }
      let id = part.linkId
      //console.log('part.linkId', part.linkId)
      //console.log('this.rfq.parts', this.rfq.parts)
      let linkedToPart = _.filter(this.parts, function (i) {
        return id == i.id
      })
      // console.log('linkedToPart', linkedToPart)
      if (!linkedToPart || !linkedToPart[0]) {
        return ''
      }
      if (linkedToPart[0].type === 'delivery') {
        return linkedToPart[0].deliveryName
      }
      return linkedToPart[0].name
    },
    calculateSum (parts = []) {
      let result = 0
      _.forEach(parts, part => {
        _.forEach(this.parts, partRFQ => {
          if (partRFQ.originalPartId === Number(part.originalPartId)) {
            result += Number(part.price) * Number(partRFQ.qty)
          }
        })
      })
      return result
    },
    filterSuppliers () {
      if (!this.isOEM) {
        return {}
      }

      let order = {
        OEM: 0,
        'PAR/AFTM': 1,
        PAR: 2,
        'AFTM/USED': 3,
        AFTM: 4,
        USED: 5,
        RECO: 6,
      }
      let orderedSuppliers = _.sortBy(this.rfq.suppliers, [
        s => order[s.type],
        s => s.name
      ])
      return orderedSuppliers
    },
    getSuppliersSize () {
      return _.size(this.filterSuppliers())
    },
    getColspan (number = 6) {
      if (!this.isOEM) number--
      return String(number + this.getSuppliersSize())
    },
    getData (part = null) {
      let parts = []
      if (_.isEmpty(part)) {
        parts = _.map(this.parts, (prt, index) => {
          let data = {
            price: prt.price,
            partNumber: prt.number,
            rrp: prt.rrp,
            name: prt.name,
            stock: String(prt.selectedOption.value),
            altPartName: prt.altPartName,
            stockComment: String(prt.stockComment),
            linkId: prt.linkId,
            linkType: prt.linkType,
            qty: prt.qty,
            listOrderNumber: prt.listOrderNumber || prt.listOrderNumber === 0 ? prt.listOrderNumber : index,
          }
          if (prt.isNotApplicable && prt.isNotApplicable === true) {
            data.isNotApplicable = true
          } else {
            data.isNotApplicable = false
          }
          if (prt.isDelivery) {
            data.deliveryName = prt.deliveryName
            data.deliveryZone = prt.deliveryZone
          }
          if (prt.id) data.id = prt.id
          return data
        })
      } else {
        let index = this.parts.indexOf(part)
        let newPrt = {
          price: part.price,
          partNumber: part.number,
          rrp: part.rrp,
          name: part.name,
          stock: part.selectedOption && part.selectedOption.value !== null ? String(part.selectedOption.value) : null,
          altPartName: part.altPartName,
          stockComment: String(part.stockComment),
          linkId: part.linkId,
          linkType: part.linkType,
          qty: part.qty,
          listOrderNumber: part.listOrderNumber || part.listOrderNumber === 0 ? part.listOrderNumber : index,
          type: part.type
        }
        if (part.isNotApplicable && part.isNotApplicable === true) {
          newPrt.isNotApplicable = true
        } else {
          newPrt.isNotApplicable = false
        }
        if (part.isDelivery) {
          newPrt.deliveryName = part.deliveryName
          newPrt.deliveryZone = part.deliveryZone
        }
        if (part.id) newPrt.id = part.id
        parts.push(newPrt)
      }
      return {
        rfqId: this.rfq.id,
        discountApplied: this.rfq.discountsApplied,
        partsDeliveryETA: this.rfq.partsDeliveryETA,
        parts: parts,
      }
    },
    sendPrices () {
      if (this.isLoading) return

      // check AFTM or USED has mark their optional parts (if any)
      if (!this.optionalPartCheck()) {
        this.$toast.error('An optional part/s type has not been set. Check again')
        // enable notification
        this.enableOptionalCheck = true
        return
      }
      // return;

      this.isLoading = true
      NProgress.start()
      let data = this.getData(this.rfq)
      Axios.post('/ir/supplier/rfq/' + this.rfq.id + '/submit-pricing', data)
        .then(response => {
          NProgress.done()
          this.$emit('priced')
          if (response.data.status) {
            this.$toast.success('Quote has been priced')
            this.showAltPartNameId = 0
          }
        })
        .catch(error => {
          console.log(error)
          this.$toast.error('An error occurred in pricing Request For Quote')
          NProgress.done()
        }).finally(() => {
        this.isLoading = false
      })
    },
    changedPartsOrder () {
      let data = { sorts: [] }
      console.log('changedPartsOrder')
      let order = 0
      this.parts = _.orderBy(this.parts, [(itm) => Number(itm.listOrderNumber), (itm) => Number(itm.id)])
      this.parts.forEach((prt, ind) => {
        prt.listOrderNumber = ind
        data.sorts.push({
          id: prt.id,
          listOrderNumber: prt.listOrderNumber
        })
      })
      // this.rfq.parts = this.parts
      Axios.post('/ir/supplier/rfq/' + this.rfq.id, data)
        .then(() => {
          this.isDraggabling = false
        })
        .catch(error => {
          console.log(error)
        }).finally(() => {
        this.isDraggabling = false
      })
    },
    linkPart (part, linkId, linkType) {
      this.isDraggabling = true
      this.parts = _.orderBy(this.parts, [(itm) => Number(itm.listOrderNumber), (itm) => Number(itm.id)])
      this.parts.forEach((prt, ind) => {
        prt.listOrderNumber = ind
      })
      let linkedPrt = _.find(this.parts, (prt) => {
        return Number(linkId) === Number(prt.id)
      })
      part.linkId = linkId
      part.linkType = linkType
      if (linkType === 'withCost') {
        part.rrp = 0
      }
      part.listOrderNumber = Number(linkedPrt.listOrderNumber) + 0.5
      console.log(Number(_.cloneDeep(linkedPrt).listOrderNumber) + 0.5, 'link part')
      this.changedPartsOrder()
      // this.savePart(part)
      setTimeout(() => {
        this.savePart(part)
      }, 1000)
    },
    unlinkPart (part) {
      // console.log('unlinkPart', part, (part.linkId>part.id))
      part.linkId = 0
      part.linkType = null
      if (part.rrp === '-1.00') {
        part.rrp = '0.00'
      }

      let id = Number(part.id)
      let indexOld = Number(_.cloneDeep(part).listOrderNumber)
      let index = null
      let isIndexLast = false

      _.forEach(this.parts, (prt, prtIndex) => {
        // console.log(prt, prtIndex, prt.id, id, this.parts,)
        if (Number(prtIndex) === 0) {
          if ((Number(prt.id) - 1) === id) {
            index = 0
            return false
          }
        } else {
          let prevPrt = this.parts[prtIndex - 1]
          let isNotLinkedPrevPart = !!(prevPrt && !(prevPrt.linkId > 0))
          let isNotLinkedCurrentPart = !!(prt && !(prt.linkId > 0))
          if (isNotLinkedCurrentPart && isNotLinkedPrevPart && (Number(prt.id) - 1) === id) {
            if (prtIndex + 1 === this.parts.length) {
              isIndexLast = true
              index = Number(prt.listOrderNumber)
              return false
            }
            index = Number(prt.listOrderNumber)
            return false
          } else if (prt.id >= id) {
            id = prt.id
          }
        }
      })

      if (index !== null) {
        part.listOrderNumber = index
      } else {
        part.listOrderNumber = 999
      }

      if (index === 999) {
        _.forEach(this.parts, (prt) => {
          if (Number(prt.listOrderNumber) >= indexOld && Number(prt.id) !== Number(part.id)) {
            prt.listOrderNumber--
          } else if (Number(prt.id) === Number(part.id)) {
            part.listOrderNumber = this.parts.length - 1
          }
        })
      } else if (isIndexLast) {
        _.forEach(this.parts, (prt) => {
          if (Number(prt.listOrderNumber) >= indexOld && Number(prt.id) !== Number(part.id)) {
            prt.listOrderNumber--
          }
        })
      } else {
        _.forEach(this.parts, (prt) => {
          if (Number(prt.listOrderNumber) >= index) {
            prt.listOrderNumber++
          }
        })
      }

      // this.parts = _.orderBy(this.parts, [(itm) => Number(itm.listOrderNumber), (itm) => Number(itm.id)])
      console.log(this.parts, 'index', index)
      this.changedPartsOrder()
      setTimeout(() => {
        this.savePart(part)
      }, 1000)
    },
    isHasLinkedParts (part) {
      return _.some(this.parts, (prt) => {
        return Number(prt.linkedId) === Number(part.id)
      })
    },
    onChange (part) {
      this.isDisabledSave = false
      this.savePart(part)
    },
    savePart (part) {
      this.savePrices(false, part)
    },
    savePrices (afterSubmitting = false, part) {
      if (this.isLoading) return
      if (this.priceResubmitFlag && !afterSubmitting) return
      this.isLoading = true
      NProgress.start()
      this.$emit('resubmitting')
      let data = this.getData(part)
      data.isAfterSubmittingUpdate = afterSubmitting
      if (this.rfq.rfqUpdateRequested === 'UpdateRequested' && this.priceResubmitFlag) {
        data.isAfterSubmittingUpdate = false
      }
      return new Promise((resolve, reject) => {
        Axios.post('/ir/supplier/rfq/' + this.rfq.id, data)
          .then(response => {
            if (response.data.status) {
              resolve(response.data)
              this.showAltPartNameId = 0
            }
          })
          .catch(error => {
            reject(error)
            console.log(error)
          })
          .finally(() => {
            this.isLoading = false
            NProgress.done()
          })
      })
    },
    addNewPart (type) {
      if (this.isLoading) return
      this.isLoading = true
      NProgress.start()
      let id = null
      let payload = type === 'delivery' ? { addDelivery: true } : { addPart: true }
      Axios.post('/ir/supplier/rfq/' + this.rfq.id, payload).then(response => {
        if (response.data.status && response.data.manualPartId && response.data.manualPartId > 0) {
          id = response.data.manualPartId
          let prt = {
            comment: 0,
            id: response.data.manualPartId,
            price: 0,
            status: 0,
            qty: 1,
            number: '',
            rrp: 0,
            name: '',
            gstTax: 10,
            type: type,
            listOrderNumber: 999,
          }

          let newPart = new Part(prt)
          let newData = this.parts
          newData.push(newPart)
          newData = _.orderBy(newData, [(itm) => Number(itm.listOrderNumber), (itm) => Number(itm.id)])
          this.$set(this.rfq, 'parts', newData)
          setTimeout(() => {
            // this.savePrices()
            if (type === 'delivery') {
              this.focusElement('deliveryName-' + response.data.manualPartId)
            } else {
              this.focusElement('manual-name-' + response.data.manualPartId)
            }
          }, 500)

          // this.rfq.addManualPart(response.data.manualPartId) //#153 - remove this
        }
      }).catch(error => {
        console.log(error)
        this.$toast.error('An error occurred in submitting your request')
      }).finally(() => {
        this.isLoading = false
        NProgress.done()
        this.lastManualPartId = id
      })
    },
    removePart (part, key) {
      if (this.isLoading) return
      this.isLoading = true
      NProgress.start()
      let data = {
        removePartId: part.id
      }
      Axios.post('/ir/supplier/rfq/' + this.rfq.id, data)
        .then(response => {
          if (response.data.status && response.data.removedManualPart && response.data.removedManualPart == part.id) {
            this.rfq.removePartByKey(key)
          }
        })
        .catch(error => {
          console.log(error)
          this.$toast.error('An error occurred in submitting your request')
        }).finally(() => {
        this.isLoading = false
        NProgress.done()
      })
    },
    addOptionalPart (part) {
      const index = this.parts.findIndex(_part => part.id === _part.id)
      if (index >= 0) {
        if (this.isLoading) return
        this.isLoading = true
        NProgress.start()
        Axios.post('/ir/supplier/rfq/' + this.rfq.id, {
          addOptionalPart: true,
          toPartId: part.originalPartId,
        }).then(response => {
          if (response.data.status && response.data.optionalPartId && response.data.optionalPartId > 0) {
            this.parts.splice(index + 1, 0, new Part({
              id: response.data.optionalPartId,
              qty: this.parts[index].qty,
              comment: '',
              name: 'Optional Part',
              partNumber: '',
              rrp: null,
              stock: 0,
              stockComment: '',
              optionalPartComplete: false,
              type: 'optional' // assumed optional part type defined here
            }))
          }
        }).catch(error => {
          console.log(error)
          this.$toast.error('An error occurred in Add Optional Part')
        }).finally(() => {
          this.isLoading = false
          NProgress.done()
        })

      } else {
        console.log('Part selected not found')
      }
    },
    setOptionalPartType (optionalPart, typeName) {
      const partIndex = this.parts.findIndex(_part => _part === optionalPart)
      if (partIndex) {
        this.parts[partIndex].name = this.parts[partIndex].name.split(' - ')[0].concat([` - ${typeName}`])
        this.parts[partIndex].optionalPartComplete = true
        this.savePrices()
      }
    },
    removeOptionalPart (optionalPart) {
      console.log('removeOptionalPart', optionalPart)
      const partIndex = this.parts.findIndex(_part => _part === optionalPart)
      console.log('partIndex', partIndex)
      if (partIndex) {
        this.removePart(optionalPart, partIndex)
      }
    },
    handlePartnameRightClick (e, part, index) {
      if (this.isNewStatus) {
        this.closeContextMenu()
        this.$set(this.parts[index], 'isSelected', true)
        this.selectedPartId = part.id
        this.selectedPartIndex = index
        this.$refs.menuPartName.open(e, part)
      }
    },
    closeContextMenu () {
      console.log('close', this.selectedPartId, this.parts,)
      this.selectedPartId = null
      if (this.selectedPartIndex === null) {
        return
      }
      _.forEach(this.parts, (prt, index) => {
        this.$set(this.parts[index], 'isSelected', false)
      })
    },
    handlePartnameSelected (part, selectedOption) {
      console.log('handlePartnameSelected', part, selectedOption)

      this.$refs.menuPartName.close()
      if (selectedOption.menu.value === 'markAsFreight') {
        this.markAsDelivery(part)
      } else if (selectedOption.menu.value === 'link' && selectedOption.submenu) {
        this.linkPart(part, selectedOption.submenu.id, selectedOption.menu.linkType)
      } else if (selectedOption.menu.value === 'unlink') {
        this.unlinkPart(part)
      } else if (selectedOption.menu.value === 'altPartName') {
        this.showAltPartNameId = part.id
      } else if (selectedOption.menu.value === 'editPartName') {
        this.showAltPartNameId = part.id
      } else if (selectedOption.menu.value === 'removePartName') {
        this.showAltPartNameId = 0
        part.altPartName = ''
        this.savePart(part)
      } else if (selectedOption.menu.value === 'addOptionalPart') {
        this.addOptionalPart(part)
      } else if (selectedOption.menu.value === 'setOptionalPartType') {
        this.setOptionalPartType(part, selectedOption.submenu.name)
      } else if (selectedOption.menu.value === 'removeOptionalPart') {
        this.removeOptionalPart(part)
      } else if (selectedOption.menu.value === 'markNotApplicable') {
        this.markNotApplicable(part)
      } else if (selectedOption.menu.value === 'unMarkNotApplicable') {
        this.unMarkNotApplicable(part)
      }
    },
    markNotApplicable (part) {
      part.partNumber = 'NOT APPLICABLE'
      part.stock = 3
      part.stockComment = 'NOT APPLICABLE'
      part.isNotApplicable = true
      part.price = 0

      this.$refs['stock-select-' + part.id][0].selectNoStockOption()
      this.savePart(part)
    },
    unMarkNotApplicable (part) {
      part.partNumber = ''
      part.stock = 0
      part.stockComment = ''
      part.isNotApplicable = false
      part.price = null

      this.$refs['stock-select-' + part.id][0].selectNoneStockOption()
      this.savePart(part)
    },
    selectStockStatus ({ comment, label, textValue, value, isHighlight }, partIndex) {
      if (!isHighlight) {
        this.parts[partIndex].stock = value
        this.parts[partIndex].stockComment = comment
        this.isDisabledSave = false
        this.savePart(this.parts[partIndex])
      }
    },
    handleContextOpen (e) {
      this.$refs['menuPartName'].$el.querySelector('.partname-menu').focus()
    },
    onPartReorderChange ({ moved }) {
      // console.log('onPartReorderChange', this.rfq.parts)
      // console.log('Part order change', moved, moved.element.name)

      if (moved.oldIndex === moved.newIndex) {
        return
      }

      moved.element.listOrderNumber = moved.newIndex
      let data = { sorts: [] }

      let i = 0
      this.parts.forEach(part => {
        part.listOrderNumber = i++
        data.sorts.push({
          id: part.id,
          listOrderNumber: part.listOrderNumber
        })
      })

      Axios.post('/ir/supplier/rfq/' + this.rfq.id, data)
        .then(response => {
          console.log('Reorder Response: %o', response.data)
//          this.rfq.parts = this.parts
          this.isDraggabling = false

        })
        .catch(error => {
          console.log(error)
          this.$toast.error('An error occurred in submitting your request')
        }).finally(() => {
        this.isDraggabling = false
      })
    },
    checkName (name) {
      const arr = name.split(' - ')
      return arr.length > 1
    },
    optionalPartCheck () {
      let passed = true
      this.parts.forEach(part => {
        if (part.isOptional) {
          passed = this.checkName(part.name)
          // console.log('optionalPartCheck', passed, part.type, part, this.checkName(part.name));
        }
      })
      return passed
    },
  },
  mounted () {
    //$('.b-table-sticky-header').height($(window).height() - 160)
  },
  components: {
    Numeral,
    StockSelect,
    VueContext,
    partNameMenu,
    draggable,
    DatePicker,
    Multiselect,
  },
}
</script>


<style>
.ghost-items {
    /*width: 100%;*/
    background-color: #F9F9F9 !important;
    border: 2px solid #29bcc179 !important;
    box-shadow: 0 0 0 0.3rem #29bcc13b !important;
    border-radius: 3px;
    box-sizing: border-box;
  z-index: 2 !important;
}

/*.ghost-items .td.part-list-part-name {*/
/*  min-width: 300px;*/
/*}*/

/*.ghost-items .td.part-list-number {*/
/*  min-width: 190px;*/
/*}*/

/*.ghost-items .td.part-list-in-stock {*/
/*  min-width: 155px;*/
/*}*/

/*.ghost-items .td.part-list-qty {*/
/*  min-width: 20px;*/
/*}*/

/*.ghost-items .td.part-list-rrp {*/
/*  width: 100px;*/
/*}*/

/*.ghost-items .part-list-company-price {*/
/*  min-width: 100px;*/
/*}*/

</style>

<style scoped>
.selected-row {
    background-color: rgb(233, 248, 249) !important;
}

.selected-part {
    background-color: rgb(233, 248, 249) !important;
}

.part-list-part-name.td-optional-part {
    padding-left: 25px !important;
}

.td-alt-name,
.td-add-alt-name {
    /* height: 56px !important; */
    height: auto !important;
    padding: 0.75em 15px !important;
}

.td-wrapper {
    display: flex;
    justify-content: flex-start;
    align-items: center;
}

/* .td-add-alt-name {
    height: 56px !important; /*
} */

.td-add-alt-name .part-list-item-name {
}

.part-list-item-name .div-add-alt-name {
    opacity: 0.5 !important;
    color: #1C1F39 !important;;
    margin-bottom: 8px !important;
}

.part-list-item-name .div-add-alt-name:last-child {
    margin-bottom: 0px !important;
}

.part-list-item-name > span {
    margin-bottom: 4px;
}

.td-alt-name .form-control,
.td-add-alt-name .form-control {
    display: block;
    width: 200px !important;
}


.part-list .td-selected {
    color: #212529 !important;
}

.part-list .bxs-check-circle, .part-list .bxs-minus-circle {
    /* left: 30px; */
}

.part-list .bxs-minus-circle {
    color: #c03f4f;
}

.part-list .offer-checked {
    border: 1px solid rgba(46, 169, 255, 0.1);
    background-color: rgba(46, 169, 255, 0.1);
}

.part-list table th:first-child,
.part-list table td:hover:first-child {
    border-radius: 4px 0 0 4px !important;
}

.part-list table th:last-child,
.part-list table td:hover:last-child {
    border-radius: 0 4px 4px 0 !important;
}

.part-list .b-value {
    width: 300px;
    word-break: break-all;
}

.part-list .remove-part {
    color: #ff5e5e;
    cursor: pointer;
}

.part-list .w-90 {
    width: 90%;
}

.part-list .add-part {
    color: #29BBC1;
    opacity: 1;
}

.part-list .add-part i {
    font-size: 16px;
}

.part-list .add-part span {
    display: inline-block;
    position: relative;
    bottom: 2px;
}

.part-list table th span {
    background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSIxNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMy4yMzkgMTMuMjY1VjIuNzM0bC0xLjkzIDIuMDNhLjczNS43MzUgMCAwMS0xLjA2Ny0uMDEuODMuODMgMCAwMS0uMDEtMS4xMjNMMy40NjIuMjM0YS43MzUuNzM1IDAgMDExLjA3NiAwbDMuMjMgMy4zOTdhLjgyOS44MjkgMCAwMS4yMDcuNzc5Ljc4Mi43ODIgMCAwMS0uNTQzLjU3Mi43MzYuNzM2IDAgMDEtLjc0LS4yMTlsLTEuOTMtMi4wMjh2MTAuNTNsMS45My0yLjAzYS43MzYuNzM2IDAgMDEuNzQtLjIxOC43ODIuNzgyIDAgMDEuNTQzLjU3MmMuMDcuMjgtLjAxLjU3OC0uMjA3Ljc3OWwtMy4yMyAzLjM5N0EuNzQuNzQgMCAwMTQgMTZhLjc0Ljc0IDAgMDEtLjUzOC0uMjM1bC0zLjIzLTMuMzk4YS44MjkuODI5IDAgMDEtLjIwNy0uNzc5Ljc4Mi43ODIgMCAwMS41NDMtLjU3MmMuMjY3LS4wNzMuNTUuMDEuNzQuMjE5bDEuOTMgMi4wM3oiIGZpbGw9IiMxQjFFMzgiIGZpbGwtcnVsZT0ibm9uemVybyIgb3BhY2l0eT0iLjI1Ii8+PC9zdmc+);
    height: 16px;
    width: 8px;
    display: inline-block;
    cursor: pointer;
    position: absolute;
    margin-left: 6px;
}

.part-list {
    font-family: "Inter", serif !important;
    font-weight: 600 !important;
}

.part-list .b-table-sticky-header {
    width: auto;
    padding-right: 10px;
}

.part-list .table-width-2 {
    width: 1310px !important;
}

.part-list .table-width-3 {
    width: 1360px !important;
}

.part-list .table-width-4 {
    width: 1400px !important;
}

.part-list .part-list-total {

}

.subheader-p-l {
    padding-left: 150px !important;
    height: 42px;
    border-right: 1px solid rgba(27, 30, 56, 0.25);
}

.subheader-p-l-b {
    padding-left: 950px !important;
    height: 42px;
    border-right: 1px solid rgba(27, 30, 56, 0.25);
}

.sticky {
    position: fixed;
    top: 250px;
}

.part-list .h-totals {
    font-size: 14px !important;
    font-weight: bold !important;
}

.part-list .part-values {
    color: #85868e;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0;
    line-height: 16px;
}

.part-list .table th {
    padding: 15px 5px !important;
}

.part-list table {
    width: 1300px !important;
}

.part-list .part-list-item-gst {
    width: 100%;
    word-break: break-all;
}

.part-list .part-list-item-total {
    word-break: break-all;
    width: 100%;
}

.part-list .part-list-item-in-stock {
    width: 100%;
    min-width: 140px;
}

.supplier-rfq-view-page .import-dms-additional-block {
    justify-content: center;
}

.supplier-rfq-view-page .dropdown-options .import-dms-option a {
    height: auto !important;
}

.supplier-rfq-view-page .part-list {
    margin-top: 15px;
    margin-left: 15px;
    overflow-x: scroll;
}

.supplier-rfq-view-page .part-list .table {
    width: auto;
}

.supplier-rfq-view-page .part-list .table .subheader {
    opacity: 0.5;
    color: #1C1F39;
    font-size: 12px;
    font-weight: bold;
    letter-spacing: 0;
    line-height: 16px;
}

.supplier-rfq-view-page .part-list .table .subheader-p-c {
    text-align: right;
    padding-right: 30px;
    height: 42px;
    border: 1px solid rgba(27, 30, 56, 0.1);
}

.supplier-rfq-view-page .part-list .table .subheader-t {
    text-align: right;
    padding-right: 98px;
    height: 57px;
    border: 1px solid rgba(27, 30, 56, 0.1);
    position: relative;
}

.supplier-rfq-view-page .part-list .table .p-c-value {
    color: #1C1F39;;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0;
    line-height: 16px;
}

.supplier-rfq-view-page .part-list .table .totals-value {
    color: #1C1F39;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0;
    line-height: 19px;
}


.supplier-rfq-view-page .part-list th.part-list-number {
    width: 119px;
}

.supplier-rfq-view-page .part-list th.part-list-rrp {
    width: 70px;
}

.supplier-rfq-view-page .part-list th.part-list-in-stock,
.supplier-rfq-view-page .part-list td.part-list-in-stock {
    width: 155px;
}

.supplier-rfq-view-page .part-list .stock-select-header {
    position: absolute;
    bottom: 2px;
    width: 145px;
}

.supplier-rfq-view-page .part-list th.part-list-part-name,
.supplier-rfq-view-page .part-list td.part-list-part-name {
    min-width: 300px;
}

.supplier-rfq-view-page .part-list td.part-list-part-name {
    padding: 0px 0px 0px 5px;
}

.supplier-rfq-view-page .part-list td.part-list-part-name:hover {
    cursor: context-menu;
}

.supplier-rfq-view-page .part-list th.part-list-qty,
.supplier-rfq-view-page .part-list td.part-list-qty {
    width: 20px;
}

.supplier-rfq-view-page .part-list .part-list-company-price-other {
    width: 60px;
}

.supplier-rfq-view-page .part-list .part-list-company-price {
    width: 100px;
}

.supplier-rfq-view-page .part-list .part-list-rrp {
    width: 100px;
    min-width: 70px;
}

.supplier-rfq-view-page .part-list .part-list-item-company-price {
    width: 100%;
    word-break: break-all;
    min-width: 75px;
}

.supplier-rfq-view-page .part-list .part-list-item-rrp {
    width: 100%;
    min-width: 75px;
}

.supplier-rfq-view-page .part-list th.part-list-supplier,
.supplier-rfq-view-page .part-list td.part-list-supplier {
    width: 135px;
}

.supplier-rfq-view-page .part-list th.part-list-gst,
.supplier-rfq-view-page .part-list td.part-list-gst {
    width: 70px;
}

.supplier-rfq-view-page .part-list th.part-list-total,
.supplier-rfq-view-page .part-list td.part-list-total {
    width: 80px;
}

.supplier-rfq-view-page .part-list td div.color-black {
    color: #1C1F39;
}

.supplier-rfq-view-page .part-list td div.part-list-item-name {
    display: flex;
    flex-flow: column wrap;
    align-items: flex-start;
    width: 100%;
    font-size: 12px;
    font-weight: bold;
    letter-spacing: 0;
    line-height: 16px;

    /* prevent text highlighting when right click */
    -youbkit-touch-callout: none; /* iOS Safari */
    -youbkit-user-select: none; /* Chrome 6.0+, Safari 3.1+, Edge & Opera 15+ */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* IE 10+ and Edge */
    user-select: none;
}

.supplier-rfq-view-page .part-list .part-list-item-name.has-link span {
    opacity: 0.5;
    color: #1C1F39;
}

.supplier-rfq-view-page .part-list .part-list-item-name.has-link {
    padding-left: 20px;
}

.supplier-rfq-view-page .part-list .part-list-part-name__icon-group {
    margin: 0 0 0 auto;
    display: flex;
    align-items: center;
}

.supplier-rfq-view-page .part-list .part-list-part-name__icon {
    font-size: 24px;
    color: grey;
    margin-right: 10px;
}

.supplier-rfq-view-page .part-list .part-list-part-name__icon--comment {
    /* color: #E5A025; */
    font-size: 24px;
}

.supplier-rfq-view-page .part-list th.part-list-number,
.supplier-rfq-view-page .part-list td.part-list-number {
    min-width: 190px;
}

.supplier-rfq-view-page .part-list td div.part-list-item-number {
    font-size: 12px;
    letter-spacing: 0;
    line-height: 16px;
}

.supplier-rfq-view-page .part-list td div.color-black {
    color: #1C1F39;
}

.supplier-rfq-view-page .part-list td div.part-list-item-qty {
    color: #1C1F39;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0;
    line-height: 16px;
}

.supplier-rfq-view-page .part-list td div.part-list-item-price {
    opacity: 0.5;
    color: #1C1F39;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0;
    line-height: 16px;
}

.multiselect__select:before {
    font-size: 23px;
}

.multiselect__option {
    height: 40px;
}

.v-context {
    width: auto !important;
    border-radius: 5px;
}

/* Drag drop */
.handle {
    cursor: move;
}

.table tbody + tbody {
    border-top-width: 1px;
}

/* end drag drop */

.rfq-view-body .datetime-field-value {
    width: 25%;
}

.rfq-view-body .bx-calendar-week {
    padding: 0.8rem 0.75rem;
    position: absolute;
    right: 0;
    z-index: 9;
}

.V3 .supplier-rfq-view-page .b-table-sticky-header > .table.b-table > thead > tr > th {
    top: -1px;
}

.status-multiselect {
    width: 130px;
    margin: 0 auto;
    margin-top: 5px;
}

.supplier-rfq-view-page .part-list .supplier-name {
    color: #1C1F39;
    font-size: 13px;
    font-weight: bold;
    letter-spacing: 0;
    line-height: 18px;
    text-align: center;
    min-height: 36px;
    margin-bottom: 10px;
}

.supplier-rfq-view-page .part-list .supplier-type {
    color: #1C1F39;
    font-size: 12px;
    font-style: italic;
    font-weight: 600;
    letter-spacing: 0;
    line-height: 16px;
    text-align: center;
}

.green-cell {
    color: #0cb458 !important;
}

.red-cell {
    color: red !important;
}

.part-list .part-values {
  position: relative;
  z-index: 1;
}
</style>

<style>
.ghost-items {
    /*opacity:0.2;*/
}

tr.handle:hover,
tr.handle:hover td,
tr.handle div.td-wrapper:hover {
    cursor: move;
}
</style>

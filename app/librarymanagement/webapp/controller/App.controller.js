sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (BaseController, MessageToast) {
    "use strict";

    return BaseController.extend("librarymanagement.controller.App", {
        onInit() {
            this._oTable = this.byId("bookTable");

            this.oEditableTemplate = new sap.m.ColumnListItem({
                cells: [
                    new sap.m.Input({ value: "{bookid}", change: [this.onInputChange, this] }),
                    new sap.m.Input({ value: "{title}", change: [this.onInputChange, this] }),
                    new sap.m.Input({ value: "{author}", change: [this.onInputChange, this] }),
                    new sap.m.Input({ value: "{status}", change: [this.onInputChange, this] })
                ]
            });
        },

        onOpenAddDialog: function () {
            this.getView().byId("OpenDialog").open();
        },

        onCancelDialog: function (oEvent) {
            oEvent.getSource().getParent().close();
        },

        onCreateBook: function () {
            var oBookId = this.getView().byId("idBookId").getValue();

            if (!oBookId || isNaN(oBookId)) {
                MessageToast.show("Book ID must be a valid integer");
                return;
            }

            const oTable = this.getView().byId("bookTable");
            const oBinding = oTable.getBinding("items");

            if (!oBinding) {
                MessageToast.show("Data binding is not available!");
                return;
            }

            const oContext = oBinding.create({
                "bookid": parseInt(oBookId, 10),
                "title": this.byId("idTitle").getValue(),
                "author": this.byId("idAuthor").getValue(),
                "status": this.byId("idStatus").getValue()
            });

            oContext.created()
                .then(() => {
                    MessageToast.show("Book created successfully!");
                    this.getView().byId("OpenDialog").close();
                    this._oTable.getBinding("items").refresh();
                    this.submitChanges();
                })
                .catch(() => {
                    MessageToast.show("Error creating book");
                });
        },

        onMigrateAllBooks: function () {
            var oTable = this.byId("bookTable");
            var oSelected = oTable.getSelectedItem();
        
            if (!oSelected) {
                MessageToast.show("Please select a record to migrate");
                return;
            }
            var oContext = oSelected.getBindingContext(); 
        
            if (!oContext) {
                MessageToast.show("No binding context found!");
                return;
            }
        
            var oData = oContext.getObject();
            console.log(oData); 
            var that = this;
            axios.post("/odata/v4/library/migrateAllBooks", { bookid: oData.bookid })
                .then(function (response) {
                
                    MessageToast.show(response.data.value);
                    console.log("Migration Response:", response.data);
                    that.getView().getModel().refresh();
                })
                .catch(function (error) {
                    MessageToast.show("Error: " + error.message);
                    console.error("Migration Error:", error);
                });
        },                                     

        onEditMode: function () {
            this.byId("editModeButton").setVisible(false);
            this.byId("saveButton").setVisible(true);
            this.byId("deleteButton").setVisible(true);
            this.rebindTable(this.oEditableTemplate, "Edit");
        },

        onDelete: function () {
            var oSelected = this.byId("bookTable").getSelectedItem();
            if (!oSelected) {
                MessageToast.show("Please select a row to delete.");
                return;
            }

            var oBookId = oSelected.getBindingContext().getObject().bookid;
            oSelected.getBindingContext().delete("$auto").then(() => {
                MessageToast.show(oBookId + " successfully deleted.");
            }).catch((oError) => {
                MessageToast.show("Deletion Error: " + oError.message);
            });
        },

        rebindTable: function (oTemplate, sKeyboardMode) {
            this._oTable.bindItems({
                path: "/Books",
                template: oTemplate,
                templateShareable: true
            }).setKeyboardMode(sKeyboardMode);
        },

        onInputChange: function () {
            this.refreshModel();
        },

        refreshModel: function () {
            return new Promise((resolve, reject) => {
                this.makeChangesAndSubmit(resolve, reject);
            });
        },

        makeChangesAndSubmit: function (resolve, reject) {
            const oModel = this.getView().getModel();
            const sGroup = "$auto";

            if (oModel.hasPendingChanges(sGroup)) {
                oModel.submitBatch(sGroup)
                    .then(() => {
                        MessageToast.show("Record updated successfully");
                        resolve();
                    })
                    .catch((err) => {
                        MessageToast.show("Something went wrong: " + err.message);
                        reject(err);
                    });
            } else {
                resolve();
            }
        }
    });
});

import { Component, OnInit } from '@angular/core';
import { LocationService } from '../../../../../components/auth/location.service';
import { AuthService } from '../../../../../components/auth/auth.service';
import { CustomerService } from '../../../../../components/auth/customer.service';
import { LanguageService } from '../../../../../components/auth/language.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from "../../../../../environments/environment";

declare var jquery: any;
declare var Dropzone: any;
declare var $: any;

@Component({
    selector: 'app-edit-destinations',
    templateUrl: './edit-destinations.component.html',
    styleUrls: ['../../../customer.item.edit.css']
})
export class EditDestinationsComponent implements OnInit {

    basePath = environment.basePath;
    destinationData = {
        destination_code: '',
        uid: '',    
        building_id: '',
        floor_id: '',
        destination_name: [],
        category: '',
        current_status: '',
        parent: '',
        opening_hours: '',    
        validity: '',    
        logo: [],
        destination_icon: [],
        website: '',
        email: '',
        phone: '',
        info: '',
        tags: [],
        latitude: 0.0,
        longitude: 0.0,
        status: true
    };

    MapType = '';

    public editorConfig = {
        theme: 'snow',
        placeholder: '',
        modules: {
        
        }
    }

    currentUser = {};
    currentLanguage = '';
    currentName = '';

    timeslots = [];
    languages = [];
    
    categoryList = [];

    locationService: LocationService;
    authService: AuthService;
    customerService: CustomerService;
    toastrService: ToastrService;
    languageService: LanguageService;
    Router: any;
    route : any;
    isAdd = false;
    showNameList = []; 

    constructor(private _locationService: LocationService,
                private _authService: AuthService,
                private _customerService: CustomerService,
                private _toastrService: ToastrService,
                private _languageService: LanguageService,
                private router: Router,
                private _route: ActivatedRoute) {
        this.locationService = _locationService;
        this.authService = _authService;
        this.customerService = _customerService;
        this.toastrService = _toastrService;
        this.languageService = _languageService;
        this.Router = router;
        this.route = _route;
    }

    ngOnInit() {
        this.initaiteImageDropzone();    
        
        this.reset();
        let self = this;
        this.authService.currentUserChanged.subscribe(user => {
            self.currentUser = user;
            self.reset();
        });
        let id = this.route.snapshot.params['id'];
        this.getDestination(id);
    }

    reset() {
        let self = this;
        this.authService.getCurrentUser().then(user => {      
            self.currentUser = user;
            self.loadCategories();
            self.getTimeslots();
            console.log(self.currentUser);        
        });
    }

    getDestination(id) {
        let self = this;
        this.customerService.getDestinationbyId(id)
        .then(res=> {
            self.destinationData = res.json();
            self.getFloors();
            self.displayEditImage();
            self.getLanguages();
            //self.initaiteMap();
            console.log("destination data================" + self.destinationData);
        })
    }

    getFloors(){
        let self = this;
        this.customerService.getFloors().then(
        res => {                
            let floors = res.json();
            for (let i = 0; i < floors.length; i++){
                if (floors[i].building_id = self.destinationData.building_id && floors[i].short_name == self.destinationData.floor_id){
                    self.MapType = self.basePath + '/' + floors[i].map[0];
                }
            }      
            console.log("Maptype ======= " + self.MapType);
        },
        err => {        
            self.toastrService.error('Failed to get floors list.', 'Error!!', {"positionClass": "toast-bottom-right"});
        }
        )
    }

    displayEditImage (){
        var myDropzone = new Dropzone("#fileupload");
        console.log("k");
        var filelist = this.destinationData.logo;    
        if (filelist.length != undefined) {
            for (var i = 0; i < filelist.length; i++) {
                var st = filelist[i];
                var file_name = st.substring(st.lastIndexOf("/") + 1);
                var mockFile ={ name: file_name, size: 12345, attachment_id: file_name };
                
                myDropzone.options.addedfile.call(myDropzone, mockFile);
                myDropzone.options.thumbnail.call(myDropzone, mockFile, this.basePath + "/" + st);

                $('.dz-details .dz-size').addClass("hidden");
                $('.dz-preview').css('width','98%');
            }
        }    
        this.displayEditICon();    
    }

    displayEditICon(){
    var myIconDropzone = new Dropzone("#iconupload");
    console.log("k");
    var filelist = this.destinationData.destination_icon;    
    if (filelist.length != undefined) {
        for (var i = 0; i < filelist.length; i++) {
            var st = filelist[i];
            var file_name = st.substring(st.lastIndexOf("/") + 1);
            var mockFile ={ name: file_name, size: 12345, attachment_id: file_name };
            
            myIconDropzone.options.addedfile.call(myIconDropzone, mockFile);
            myIconDropzone.options.thumbnail.call(myIconDropzone, mockFile, this.basePath + "/" + st);
            $('.dz-details .dz-size').addClass("hidden");
            $('.dz-preview').css('width','98%');
        }
    }    
    }

    loadCategories() {
        let self = this;
        this.locationService.getCategory().toPromise()
        .then(
        categories => {                                
            self.categoryList = categories;
        },
        err => {
            console.log(err);        
        }
        )
    }

    getTimeslots(){
        let self = this;
        this.customerService.getTimeslots().then(
        res => {                
            self.timeslots = res.json();
            console.log(self.timeslots)
        },
        err => {        
            self.toastrService.error('Failed to get timeslot list.', 'Error!!', {"positionClass": "toast-bottom-right"});
        }
        )  
    }

    getLanguages(){
        this.languages = this.currentUser['language'];
        if (!this.isAdd){
            for (let i = 0; i < this.destinationData.destination_name.length; i++){
                this.languages = this.languages.filter(item => item._id != this.destinationData.destination_name[i].language);
            }
            this.getShowNameList();
        }
    }

    addNameLanguage() {
        if (this.currentLanguage == "" || this.currentName == ""){
            this.toastrService.error('Add building name.', 'Error!!', {"positionClass": "toast-bottom-right"});
        } else {
            this.destinationData.destination_name.push({
                language: this.currentLanguage,
                name: this.currentName        
            });
            this.languages = this.languages.filter(item => item._id != this.currentLanguage);
            this.currentLanguage = "";
            this.currentName = "";
            this.getShowNameList();
        } 
    }

    getShowNameList(){
        this.showNameList = [];
        let temp = this.currentUser['language'];
        for (let i = 0; i < this.destinationData.destination_name.length; i++){
        let langName = temp.filter(item => item._id  == this.destinationData.destination_name[i].language);
        this.showNameList.push({name: this.destinationData.destination_name[i].name, 
                                        language: langName[0].language,
                                        id: langName[0]._id});      
        }
        this.currentLanguage = "";       
    }

    removeNameLanguage(language) {
        console.log(language); 
        let temp = this.currentUser['language'];       
        let lang = temp.filter(item => item._id == language);
        this.destinationData.destination_name = this.destinationData.destination_name.filter(item => item.language != language);
        this.languages.push(lang[0]);
        this.getShowNameList();
    }

    initaiteMap(){
        let self  = this;
        $(document).ready(() => {
            setTimeout(() => {
                   var notes = [{x: self.destinationData.latitude, y:self.destinationData.longitude, note:"destination"}];
                   /* $(window).load(() => { */
                       var $img = $("#image").imgNotes({
                           onEdit: function(ev, elem) {
                               var $elem = $(elem);                            
                           }
                       });                 
                       $img.imgNotes("import", notes);
                       $img.imgNotes("option","canEdit", true);
                       $("#image-map").css("top", "0");
                       $("#image-map").css("left", "15px");
                   /* }); */
            }, 1)
       });
    }

    initaiteImageDropzone() {
        $(document).ready(function () {
            Dropzone.autoDiscover = false;
            var token = "{!! csrf_token() !!}";

            Dropzone.options.fileupload = {
                url: "/project/uploadImage",
                paramName: "file",
                autoProcessQueue: false,
                maxFiles: 1,
                acceptedFiles : 'image/*,.pdf,.txt,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword',
                params: {
                    _token: token
                },
                init: function() {
                    this.on("addedfile", function(file) {
                        $('.dz-preview').css('width','98%');
                        console.log(file,'file');
                    }),

                    this.on("success", function(file, response) {
                        console.log(response,'success');
                        // $('#botofform').append('<input type="hidden" name="files[]" value="'+ response +'">');
                    }),
                
                    this.on("uploadprogress", function(file, progress, bytesSent) {
                        console.log(progress,'progress') 
                        //$('#botofform').append('<input type="hidden" name="files[]" value="'+ response +'">');
                    }),
                
                    this.on("removedfile", function(file) {
                        console.log(file);
                    })
                }
            }

            //var myDropzone = new Dropzone("#fileupload");
        });
        this.initaiteIconDropzone();
    }

    initaiteIconDropzone() {
        let self = this;
        $(document).ready(function () {
            Dropzone.autoDiscover = false;
            var token = "{!! csrf_token() !!}";

            Dropzone.options.iconupload = {
                url: "/project/uploadImage",
                paramName: "file",
                autoProcessQueue: false,
                maxFiles: 1,
                acceptedFiles : 'image/*,.pdf,.txt,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword',
                params: {
                    _token: token
                },
                init: function() {
                    this.on("addedfile", function(file) {
                        $('.dz-preview').css('width','98%');
                        console.log(file,'file');
                    }),

                    this.on("success", function(file, response) {
                        console.log(response,'success');
                        // $('#botofform').append('<input type="hidden" name="files[]" value="'+ response +'">');
                    }),
                
                    this.on("uploadprogress", function(file, progress, bytesSent) {
                        console.log(progress,'progress') 
                        //$('#botofform').append('<input type="hidden" name="files[]" value="'+ response +'">');
                    }),
                
                    this.on("removedfile", function(file) {
                        self.destinationData.destination_icon = [];
                        console.log(file);
                    })
                }
            }

            //var myIconDropzone = new Dropzone("#iconupload");
        });
    }

    save(){
        console.log(this.destinationData);
        if (this.destinationData.destination_name.length > 0){
            this.uploadFiles();
        } else {
            this.toastrService.error("The destination name is required", 'Error!!', {"positionClass": "toast-bottom-right"});
        } 
    }

    uploadFiles() {
    var self = this;
    //$scope.submitted = true;
    var loopPromises = [];    
    var files = $('#fileupload').get(0).dropzone.getAcceptedFiles();   
    if (files.length > 0){
        files.forEach(item => {
            if (item != null && item != undefined) {
            var promise = self.customerService.uploadDestinationFile(item);
            loopPromises.push(promise);
            }
        });
        
        Promise.all(loopPromises)
            .then(values => {
            var arr = values.map(function (elm) {
                return elm._body;
            });
            
            self.destinationData.logo = arr;
            self.uploadIcon();
            }, err => {          
                'The specified Destination name exist already.'
            });
        } else {
            self.uploadIcon();
        }
    }

    uploadIcon() {
        var self = this;
        //$scope.submitted = true;
        var loopPromises = [];    
        var files = $('#iconupload').get(0).dropzone.getAcceptedFiles();
        if (files.length > 0) {   
            files.forEach(item => {
            if (item != null && item != undefined) {
                var promise = self.customerService.uploadFloorFile(item);
                loopPromises.push(promise);
            }
            });    

            Promise.all(loopPromises)
            .then(values => {
                var arr = values.map(function (elm) {
                    return elm._body;
                });
                self.destinationData.destination_icon = arr;
                self.saveDestinationData();
            }, err => {          
                'The specified POI name exist already.'
            });
        } else if( self.destinationData.destination_icon.length > 0){
            self.saveDestinationData();
        } else {
            self.toastrService.error("Destination icon is required.", 'Error!!', {"positionClass": "toast-bottom-right"});
        }
    }

    saveDestinationData() {
        let self = this;        
        //this.destinationData.logo = data;

        this.customerService.editDestination(this.destinationData).then(
            res => {                
            self.Router.navigate(['/customer/home', { outlets: { popup: ['destinations'] } }]);
            },
            err => {
                console.log(err);
                if (err._body != undefined && err._body != null) {
                    self.toastrService.error(err._body, 'Error!!', {"positionClass": "toast-bottom-right"});
                } else {
                    self.toastrService.error("Failed to edit Destination.", 'Error!!', {"positionClass": "toast-bottom-right"});
                }
            }
        )
    }
}

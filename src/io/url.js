/**
 * I/O module.
 * @module io
 */
var dwv = dwv || {};
dwv.io = dwv.io || {};

/**
 * Url loader.
 * @class Url
 * @namespace dwv.io
 * @constructor
 */
dwv.io.Url = function()
{
    this.onload = null;
    this.onerror = null;
};

/**
 * Load a list of URLs.
 * @method load
 * @param {Array} ioArray The list of urls to load.
 */
dwv.io.Url.prototype.load = function(ioArray)
{
    // create closure to the class data
    var onload = this.onload;
    var onerror = this.onerror;

    // Request error
    var onErrorRequest = function(event)
    {
        onerror( {'name': "RequestError",
                  'message': "An error occurred while retrieving the file: (http) "+this.status } );
    };

    // DICOM request loader
    var onLoadDicomRequest = function(response)
    {
        // parse DICOM file
        try {
            var tmpdata = dwv.image.getDataFromDicomBuffer(response);
            // call listener
            onload(tmpdata);
        } catch(error) {
            onerror(error);
        }
    };

    // Image request loader
    var onLoadImageRequest = function(event)
    {
        // parse image data
        try {
            var tmpdata = dwv.image.getDataFromImage(this);
            // call listener
            onload(tmpdata);
        } catch(error) {
            onerror(error);
        }
    };

    // Request handler
    var onLoadRequest = function(event)
    {
        // find the image type
        var view = new DataView(this.response);
        var isJpeg = view.getUint32(0) === 0xffd8ffe0;
        var isPng = view.getUint32(0) === 0x89504e47;
        var isGif = view.getUint32(0) === 0x47494638;
        var isZip = view.getUint32(0) === 1347093252;

        // non DICOM
        if( isJpeg || isPng || isGif )
        {
            // image data as string
            var bytes = new Uint8Array(this.response);
            var imageDataStr = '';
            for( var i = 0; i < bytes.byteLength; ++i ) {
                imageDataStr += String.fromCharCode(bytes[i]);
            }
            // image type
            var imageType = "unknown";
            if(isJpeg) imageType = "jpeg";
            else if(isPng) imageType = "png";
            else if(isGif) imageType = "gif";
            // temporary image object
            var tmpImage = new Image();
            tmpImage.src = "data:image/" + imageType + ";base64," + window.btoa(imageDataStr);
            tmpImage.onload = onLoadImageRequest;
        }
        else if ( isZip )
        {

            console.log(url);
            console.log(this.response);
            zipData = this.response;

            // http://www.html5rocks.com/ja/tutorials/file/xhr2/
            window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
            window.requestFileSystem(
                TEMPORARY,
                1024*1024*100,
                function(fs){
                    fs.root.getFile('dicom.zip',{create: true}, function(fileEntry){
                        fileEntry.createWriter(function(fileWriter){
                            fileWriter.onwriteend = function(e) {
                                console.log("write end!");
                                console.log(fileEntry);
                                console.log(fileEntry.toURL())

                                //////////////////////////////////

                                // use a BlobReader to read the zip from a Blob object
                                zip.createReader(new zip.BlobReader(blobData), function(reader) {
                                    // get all entries from the zip
                                    reader.getEntries(function(entries) {
                                        if (entries.length) {
                                            window.entries = entries;
                                            console.log(entries);
                                            write_file_to_fs(entries,0);
                                        }
                                    });
                                }, function(error) {
                                    // onerror callback
                                });
                                //////////////////////////////////


                            };
                            fileWriter.onerror = function(e) {console.log("write error!")};

                            var blobData = new Blob([zipData],{type: "application/zip"});
                            fileWriter.write(blobData);
                        });
                    });
                }
            );
        }
        else
        {
            onLoadDicomRequest(this.response);
        }
    };

    // loop on I/O elements
    for (var i = 0; i < ioArray.length; ++i)
    {
        var url = ioArray[i];
        var request = new XMLHttpRequest();
        //TODO Verify URL...
        request.open('GET', url, true);
        request.responseType = "arraybuffer";
        request.onload = onLoadRequest;
        request.onerror = onErrorRequest;
        request.onprogress = dwv.gui.updateProgress;
        request.send(null);
    }

    function write_file_to_fs(files,n){
        if ( files.length <= n ) { return true; }

        fileEntry = files[n];
        filename = fileEntry.filename;
        //console.log(n);
        console.log(fileEntry);


        if ( fileEntry.compressedSize < 500 ) { write_file_to_fs(files, n+1) };

        console.log(filename);

        fileEntry.getData(new zip.BlobWriter(), function(blob){

            window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
            window.requestFileSystem(
                TEMPORARY,
                1024*1024*100,
                function(fs){
                    fs.root.getFile(filename,{create: true}, function(fileEntry){
                        fileEntry.createWriter(function(fileWriter){
                            fileWriter.onwriteend = function(e) {
                                get_arraybuffer_from_fs(filename);
                                //console.log("write end!");
                                console.log(fileEntry.toURL());
                                write_file_to_fs(files, n+1);
                            }
                            fileWriter.onerror = function(e) {console.log("write error!")};

                            var blobData = new Blob([blob],{type: "application/dicom"});
                            fileWriter.write(blobData);
                        });
                    });
                },
                function(error){console.log(error)}
            );
        });
    }

    function get_arraybuffer_from_fs(filename){

        function onInitFs(fs) {

            fs.root.getFile(filename, {}, function(fileEntry) {

                // Get a File object representing the file,
                // then use FileReader to read its contents.
                fileEntry.file(function(file) {
                    var reader = new FileReader();

                    reader.onloadend = function(e) {
                        var arrayBuffer = reader.result;
                        onLoadDicomRequest(arrayBuffer);
                    };

                    reader.readAsArrayBuffer(file);
                });
            });
        }

        window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
        window.requestFileSystem(window.TEMPORARY, 1024*1024, onInitFs);
    }

};

//Add the loader to the loader list
dwv.io.loaders = dwv.io.loaders || {};
dwv.io.loaders.url = dwv.io.Url;

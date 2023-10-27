

export const fileFilter = ( req: Express.Request, file: Express.Multer.File, callback: Function ) => {

    console.log(file);
    

    if( !file ) 
        return callback( new Error('File is empty'), false );  //Devuelvo un false porque no es el fichero que espero y se interrumpe el proceso

    const fileExtension = file.mimetype.split('/')[1];
    const validExtension = ['jpg', 'jpeg', 'png', 'gif'];

    if(validExtension.includes(fileExtension)){
        return callback(null, true); //Devuelvo un true porque es el fichero que espero, el que ha cumplido con mis reqs. Con un true, el fichero es aceptado.
    }

    callback(null, false); 
    

}
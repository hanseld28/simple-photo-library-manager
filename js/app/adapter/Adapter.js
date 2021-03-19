class Adapter {

    static adapt(className, method) {
        
        let model;

        if (className === Photo.name) {
            model = new Photo();
        }

        return method(model);
    }
}
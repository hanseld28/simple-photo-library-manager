class Photo {

    constructor(args = {}) {
        this.id = args?.id, 
        this.author = args?.author, 
        this.url = args?.downloadUrl,
        this.downloadUrl = args?.downloadUrl, 
        this.width = args?.width,
        this.height = args?.height,
        this.isFavorite = args?.isFavorite,
        this.note = args?.note,
        this.hasNote = args?.hasNote
    }

    adapt(data = {}) {
        return new Photo(
            {
                id: Number(data?.id), 
                author: data?.author, 
                url: data?.url, 
                downloadUrl: data?.download_url,
                width: Number(data?.width),
                height: Number(data?.height),
                isFavorite: false,
                note: '',
                hasNote: false
            }
        );
    }
}
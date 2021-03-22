export default interface IUrlSynchronizationService {
    updateUrlStatus(data: { url: string });
    changeContentPageUrl(url: string);
    initUrlSynchro();
}

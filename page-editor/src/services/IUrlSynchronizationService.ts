export default interface IUrlSynchronizationService {
    redirectToUrl(url: string);
    requestCurrentUrl();
    addUrlChangedListener(listener: Function);
}

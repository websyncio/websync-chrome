export default interface IUrlSynchronizationService {
    onUrlChanged(data: { url: string });
    redirectToUrl(url: string);
    initUrlSynchro();
}

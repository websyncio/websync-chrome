import Reactor from './Reactor';

export const SELECTOR_VALIDATED = 'selector-validated';

export default class SelectorValidator {
    reactor: Reactor;

    constructor() {
        this.reactor = new Reactor();
        this.reactor.registerEvent(SELECTOR_VALIDATED);
    }
}

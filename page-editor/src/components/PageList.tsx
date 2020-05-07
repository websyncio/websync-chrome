import React, { Component } from 'react';
import PageType from '../models/PageType';
import { Dropdown } from 'semantic-ui-react';

type PageListProps = {
    pageTypes: Array<PageType>;
    selected?: PageType;
    onSelectedPageChanged: any;
};

class PageList extends Component<PageListProps, any> {
    render() {
        const options = this.props.pageTypes.map((item) => {
            return {
                key: item.id,
                value: item.id,
                text: item.name,
            };
        });

        return (
            <Dropdown
                placeholder="Select Page"
                fluid
                search
                selection
                options={options}
                onChange={this.props.onSelectedPageChanged}
            />
        );
    }
}

export default PageList;

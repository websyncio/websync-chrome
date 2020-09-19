import React, { Component } from 'react';
import PageType from '../models/PageType';
import { Dropdown } from 'semantic-ui-react';
import ComponentInstance from 'models/ComponentInstance';
import Website from 'models/Website';

type WebsiteListProps = {
    websites: Array<Website>;
    selectedWebsite?: Website;
};

class WebsiteList extends Component<WebsiteListProps, any> {
    render() {
        function getName(id: any) {
            if (id === undefined) {
                return null;
            } else {
                const arr = id.split('.');
                return arr[arr.length - 1];
            }
        }

        const options = this.props.websites.map((item) => {
            return {
                key: item.id,
                value: item.id,
                text: getName(item.id),
            };
        });

        function onSelectedWebsiteChanged() {
            throw new Error('not implemented');
        }

        return (
            <Dropdown
                text={getName(this.props.selectedWebsite?.id)}
                placeholder="Select Page"
                fluid
                search
                selection
                options={options}
                onChange={onSelectedWebsiteChanged}
            />
        );
    }
}

export default WebsiteList;

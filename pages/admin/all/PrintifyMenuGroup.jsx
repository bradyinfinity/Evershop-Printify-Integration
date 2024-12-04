import PropTypes from 'prop-types';
import React from 'react';
import BookIcon from '@heroicons/react/solid/esm/BookOpenIcon';
import NavigationItemGroup from '@components/admin/cms/NavigationItemGroup';

export default function PrintifyMenuGroup({ printifyImportUrl }) {
  return (
    <NavigationItemGroup
      id="printifyMenuGroup"
      name="Printify Integration"
      items={[
        {
          Icon: BookIcon,
          url: printifyImportUrl,
          title: 'Import Printify Products'
        }
      ]}
    />
  );
}

PrintifyMenuGroup.propTypes = {
  printifyImportUrl: PropTypes.string.isRequired
};

export const layout = {
  areaId: 'adminMenu',
  sortOrder: 40
};

export const query = `
  query Query {
    printifyImportUrl: url(routeId: "printifyImport")
  }
`;

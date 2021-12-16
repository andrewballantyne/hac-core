import * as React from 'react';
import { useHistory } from 'react-router-dom';
// import { Routes } from './Routes';
import './App.scss';

import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/Registry';
import NotificationsPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';
import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { useStore } from 'react-redux';
import TestK8s from './test/TestK8s';

const App: React.FC = () => {
  const history = useHistory();

  const chrome = useChrome();
  const store = useStore();

  React.useEffect(() => {
    const registry = getRegistry();
    registry.register({ notifications: notificationsReducer });
    const { on: onChromeEvent } = chrome?.init();

    const unregister = onChromeEvent('APP_NAVIGATION', (event) => {
      if (event.domEvent) {
        history.push(`${event.domEvent.href.replace('/hac', '')}`);
      }
    });
    return () => {
      unregister();
    };
  }, [history, chrome]);

  return (
    <React.Fragment>
      <NotificationsPortal store={store} />
      <TestK8s />
    </React.Fragment>
  );
};

export default App;

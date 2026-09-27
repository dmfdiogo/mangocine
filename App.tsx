import React from 'react';
import { AppProviders } from '@app/providers/AppProviders';
import { RootNavigator } from '@navigation/RootNavigator';

function App(): React.JSX.Element {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}

export default App;

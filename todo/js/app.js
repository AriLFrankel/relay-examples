import 'todomvc-common';

import React from 'react';
import ReactDOM from 'react-dom';

import {installRelayDevTools} from 'relay-devtools';

import {
  QueryRenderer,
  graphql,
} from 'react-relay';
import {
  Environment,
  Network,
  RecordSource,
  Store,
} from 'relay-runtime';

import TodoApp from './components/TodoApp';

// Useful for debugging, but remember to remove for a production deploy.
installRelayDevTools();

const mountNode = document.getElementById('root');

function fetchQuery(
  operation,
  variables,
) {
  return fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: operation.text,
      variables,
    }),
  }).then(response => {
    return response.json();
  });
}

// TODO: RECOVER LOST NOTES ON ENVIRONMENT
const modernEnvironment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),
});
// TODO: QueryRenderer is an HOC that will fetch data for its child component
// wen it is rednered. Because it queries on render, one should be careful about
// how these are nested. The intention here is to fetch data when it's needed.
// Examples: at the app's happy path's top level; lazily load a modal's data requirements
// It takes as its arguments the environment, a query, variables to pass to 
// the query and a render callback for when the data is fetched.  
ReactDOM.render(
  <QueryRenderer
    environment={modernEnvironment}
    query={graphql`
      # This spreads out a fragment defined within TodoApp
      query appQuery {
        viewer {
          ...TodoApp_viewer
        }
      }
    `}
    variables={{}}
    render={({error, props, retry}) => {
      if (props) {
        return <TodoApp viewer={props.viewer} />;
      } else {
        return <div>Loading</div>;
      }
    }}
  />,
  mountNode
);

/* eslint-disable no-console */
import * as React from 'react';
import {
  k8sCreateResource,
  k8sDeleteResource,
  k8sGetResource,
  K8sModel,
  k8sPatchResource,
  K8sResourceCommon,
  k8sUpdateResource,
  // useK8sWatchResource,
  // WatchK8sResource,
} from './dynamic-plugin-sdk';
import { Button, PageSection, TextInput } from '@patternfly/react-core';

// TODO: this will be a problem? How do we effectively know what namespace we are in?
const namespace = 'aballantyne';

// const ProjectModel: K8sModel = {
//   apiVersion: 'v1',
//   apiGroup: 'project.openshift.io',
//   kind: 'Project',
//   abbr: 'PR',
//   label: 'Project',
//   labelPlural: 'Projects',
//   plural: 'projects',
// };
const ConfigMapModel: K8sModel = {
  apiVersion: 'v1',
  kind: 'ConfigMap',
  abbr: 'CM',
  plural: 'configmaps',
  labelPlural: 'ConfigMaps',
  label: 'ConfigMap',
  namespaced: true,
};

enum ActionType {
  CREATE = 'create',
  GET = 'get',
  PATCH = 'patch',
  PUT = 'put',
  DELETE = 'delete',
}

// const initResource: WatchK8sResource = {
//   groupVersionKind: { version: 'v1', kind: 'ConfigMap' },
//   name: 'test',
//   namespace,
// };

const TestK8s: React.FC = () => {
  const [r, setR] = React.useState(null);
  const [name, setName] = React.useState<string>('test');
  const [status, setStatus] = React.useState<string>('');
  const [action, setAction] = React.useState<ActionType | null>(null);

  // TODO: make hook work sanely
  // const result = useK8sWatchResource(initResource);
  // console.debug('render result', result);

  React.useEffect(() => {
    const testConfigMapMetadata = {
      metadata: {
        name,
        namespace,
      },
    };
    const testConfigMapData: K8sResourceCommon & { [key: string]: any } = {
      apiVersion: ConfigMapModel.apiVersion,
      kind: ConfigMapModel.kind,
      ...testConfigMapMetadata,
      data: {
        test: 'true',
      },
    };

    let promise = null;
    const then = (data) => {
      setStatus(`${action} response:`);
      setR(data);
      console.debug(`++++${action}!`, data);
    };
    switch (action) {
      case ActionType.CREATE:
        promise = k8sCreateResource({
          model: ConfigMapModel,
          data: testConfigMapData,
        }).then(then);
        break;
      case ActionType.GET:
        promise = k8sGetResource({
          model: ConfigMapModel,
          name: testConfigMapMetadata.metadata.name,
          ns: testConfigMapMetadata.metadata.namespace,
        }).then(then);
        break;
      case ActionType.PATCH:
        promise = k8sPatchResource({
          model: ConfigMapModel,
          resource: testConfigMapMetadata,
          data: [
            {
              op: 'replace',
              path: '/data/test',
              value: 'false',
            },
          ],
        }).then(then);
        break;
      case ActionType.PUT:
        promise = k8sUpdateResource({
          model: ConfigMapModel,
          name: testConfigMapMetadata.metadata.name,
          ns: testConfigMapMetadata.metadata.namespace,
          data: { ...testConfigMapData, data: { ...testConfigMapData.data, new: 'prop' } },
        }).then(then);
        break;
      case ActionType.DELETE:
        promise = k8sDeleteResource({
          model: ConfigMapModel,
          resource: testConfigMapMetadata,
        }).then(then);
        break;
      case null:
        break;
      default:
        throw new Error('uh oh!');
    }
    promise?.catch((err) => {
      console.error(`++++failed ${action}`, err);
      setStatus('failed call');
      setR(null);
    });
  }, [action, name]);

  return (
    <PageSection>
      <TextInput placeholder="ConfigMap name" onChange={(v) => setName(v)} value={name} />
      {Object.values(ActionType).map((v) => (
        <React.Fragment key={v}>
          <Button onClick={() => setAction(v)}>{v}</Button>{' '}
        </React.Fragment>
      ))}
      <div>{status}</div>
      {r && <pre>{JSON.stringify(r, null, 2)}</pre>}
    </PageSection>
  );
};

export default TestK8s;

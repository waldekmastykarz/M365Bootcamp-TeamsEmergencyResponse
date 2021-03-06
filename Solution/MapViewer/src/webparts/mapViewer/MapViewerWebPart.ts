import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version, Environment } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'MapViewerWebPartStrings';
import MapViewer, { IMapViewerProps } from './components/MapViewer';
import ServiceFactory from './services/ServiceFactory';
import { IMapDataService } from './services/MapDataService/IMapDataService';

export interface IMapViewerWebPartProps {
  credentials: string;
  zoom: string;
  mapType: string;
  listName: string;
}

export default class MapViewerWebPart extends BaseClientSideWebPart<IMapViewerWebPartProps> {

  private mapDataService: IMapDataService;

  public async onInit(): Promise<void> {
    this.mapDataService = await ServiceFactory.getMapDataService(
      Environment.type,
      this.context,
      this.properties.credentials,
      this.properties.listName
    );
  }

  public render(): void {
    const element: React.ReactElement<IMapViewerProps> = React.createElement(
      MapViewer,
      {
        mapDataService: this.mapDataService,
        credentials: this.properties.credentials,
        zoom: parseInt(this.properties.zoom),
        mapType: this.properties.mapType
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected get disableReactivePropertyChanges(): boolean {
    return true;
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {

    let zoomOptions = [];
    for (let i=1; i<=19; i++) {
      zoomOptions.push({ key: i.toString(), text: i.toString() });
    }
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('credentials', {
                  label: strings.CredentialsFieldLabel
                }),
                PropertyPaneDropdown('zoom', {
                  label: strings.ZoomFieldLabel,
                  options: zoomOptions
                }),
                PropertyPaneDropdown('mapType', {
                  label: strings.MapTypeFieldLabel,
                  options: [
                    { key: 'aerial', text: strings.AerialMapType },
                    { key: 'road', text: strings.RoadMapType }
                  ]
                })
              ]
            },
            {
              groupName: strings.SPGroupName,
              groupFields: [
                PropertyPaneTextField('listName', {
                  label: strings.ListNameFieldLabel
                })
              ]
            }

          ]
        }
      ]
    };
  }
}

import React, { Component } from 'react';
import ReactTable from 'react-table';
import Numeral from 'numeral';

import iconGreen from './icon_green.svg';
import iconOrange from './icon_orange.svg';
import iconRed from './icon_red.svg';
import iconGrey from './icon_grey.svg';

import './pure-min-0.6.2.css';
import './App.css';


const metricKeys = ['ncloc','duplicated_lines_density', 'blocker_violations','critical_violations','class_complexity','high_severity_vulns','overall_coverage'];

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      projects: [],
      metrics: {},
      statuses: []
    };
  }

  componentDidMount() {
    const metricsPromise = fetch('/api/metrics/search?f=name')
      .then( response => response.json())
      .then(json => json.metrics.reduce( (result, m) => { 
            result[m.key] = m;
            return result;
          }, {})
      );

    const resPromise = fetch('/api/resources/index?qualifiers=TRK&metrics=' + metricKeys.join(','))
      .then(response => response.json());

    Promise.all([metricsPromise, resPromise])
      .then(values => this.setState({
        metrics: values[0],
        resources: values[1]
      }))
      .then(() => {
        const resources = this.state.resources;
        const fetches = resources.map(res => 
          fetch('/api/qualitygates/project_status?projectKey=' + res.key)
          .then(res => res.json())
          .then(value => Object.assign(value.projectStatus, {key: res.key}))
        );
        return Promise.all(fetches);
      })
      .then((statuses) => this.setState({statuses}));
  }

  render() {
    const rtColumns = [
        {
          id: 'status',
          header: "",
          accessor: row => {
            const projectStatus = this.state.statuses.find(s => s.key === row.key);
            return projectStatus ? projectStatus.status : 'NONE';
          },
          render: ({value}) => {
            var icon;
            switch (value) {
              case 'OK':
                icon = iconGreen;
                break;
              case 'WARN':
                icon = iconOrange;
                break;
              case 'ERROR':
                icon = iconRed;
                break;
              default:
                icon = iconGrey;
                break;
            }
            return <img style={{maxWidth: '1em', verticalAlign: 'middle'}} src={icon}  alt={value} />
          }
        },
        {
          header: 'Name', 
          headerStyle: {textAlign: 'left'},
          accessor: 'name',
          style: {textAlign: 'left'},
          render: ({value, row}) => <a href={'http://sonar.chess.int/dashboard?id='+row.id}>{value}</a>
        }
    ];

    metricKeys.forEach(c => rtColumns.push(
      {
        id: c,
        header: this.state.metrics[c] ? this.state.metrics[c].name : "",
        accessor: resource => {
          const measure = resource.msr.find(m => m.key === c);
          return measure && measure.val;},
        render: ({value}) => <span>{this.formatMetric(c, value)}</span>
      } ));

    rtColumns.push(
      {
        id: 'date',
        header: 'Last analysis',
        accessor: resource => new Date(resource.date),
        render: ({value}) => <span>{this.formatDate(value)}</span>,
        sort: 'desc'
      }
    );


    const tableProps = {
      tableClassName: "pure-table pure-table-horizontal",
      trClassCallback: ({viewIndex}) => (viewIndex % 2 === 0) ? 'pure-table-odd' : '' ,
      minRows: 0,
      pageSize: 200,
      showPagination: false
    }
    
    return (
      <div>
        <div className="pure-g">&nbsp;</div>
        <div className="pure-g">
          <div className="pure-u-1-24"></div>
          <div className="pure-u-22-24">
          <ReactTable data={this.state.resources} columns={rtColumns} {...tableProps} />
          </div>
          <div className="pure-u-1-24"></div>
        </div>
      </div>
    );
  }

  formatMetric(metricKey, value) {
    if (value === undefined) {
      return undefined;
    }
    
    const type = this.state.metrics[metricKey].type;
    switch (type) {
        case "INT":
            return Numeral(value).format("0,0");
        case "FLOAT":
            return Numeral(value).format("0,0.0");
        case "PERCENT":
            return Numeral(value).format("0,0.0") + "%";
        default:
            return value;
    }
  }

  formatDate(d) {
    var then = new Date(0);
    then.setUTCMilliseconds(d);
    var out = "";
    var now = new Date();
    var diff = now.getTime() - then.getTime();
    if (diff < 60000) {
      out += Math.floor(diff / 1000) + " seconds ago";
    } else if (diff < 3600000) {
      out += Math.floor(diff / 60000) + " minutes ago";
    } else if (diff < 86400000) {
      out += Math.floor(diff / 3600000) + " hours ago";
    } else if (diff < 604800000) { 
      out += Math.floor(diff / 86400000) + " days ago";
    } else {
      out += then.toLocaleDateString('nl-NL');
    }
    return out;
  }

}

export default App;

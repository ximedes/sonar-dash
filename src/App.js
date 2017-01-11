import React, { Component } from 'react';
import ReactTable from 'react-table';
import Numeral from 'numeral';

import {fetchMetrics, fetchProjects, fetchProjectMeasures, fetchProjectStatus, fetchLastTaskDetails} from './fetch.js';

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
      metrics: {}
    };
  }

  componentDidMount() {
    const metricsPromise = fetchMetrics();

    const projectsPromise = fetchProjects()
      .then(projects => {
        return Promise.all(projects.map( p => 
          fetchProjectMeasures(p.key, metricKeys).then(measures => Object.assign(p, {measures})
        )))
      });

    Promise.all([metricsPromise, projectsPromise])
      .then(values => {
        this.setState({metrics: values[0]});
        return values[1];
      })
      .then(projects => {
        const fetches = projects.map(p => 
          fetchProjectStatus(p.key).then(status => Object.assign(p, {status}))
        );
        return Promise.all(fetches);
      })
      .then(projects => {
        const fetches = projects.map(p => 
          fetchLastTaskDetails(p.key).then(task => Object.assign(p, {analysisDate: task && task.submittedAt}))
        );
        return Promise.all(fetches);
      })
      .then(projects => this.setState({projects}));
    }

  render() {
    const rtColumns = [
        {
          id: 'status',
          header: "",
          accessor: project => {
            if (project.status && project.status.status) {
              return project.status.status;
            } else {
              return 'NONE';
            }
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
        accessor: project => {
          const measure = project.measures.measures.find(m => m.metric === c);
          return measure && measure.value;},
        render: ({value}) => <span>{this.formatMetric(c, value)}</span>
      } ));

    rtColumns.push(
      {
        id: 'date',
        header: 'Last analysis',
        accessor: project => project.analysisDate && new Date(project.analysisDate),
        render: ({value}) => <span>{this.formatDate(value)}</span>,
        sort: 'desc'
      }
    );


    const tableProps = {
      tableClassName: "pure-table",
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
          <ReactTable data={this.state.projects} columns={rtColumns} {...tableProps} />
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
    if (!d) {
      return '-';
    }
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

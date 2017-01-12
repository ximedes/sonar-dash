import React, { Component } from 'react';
import ReactTable from 'react-table';
import Numeral from 'numeral';

import {fetchMetrics, fetchProjects} from './fetch.js';

import iconGreen from './icon_green.png';
import iconOrange from './icon_orange.png';
import iconRed from './icon_red.png';

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
    fetchMetrics().then(metrics => this.setState({metrics}));
    fetchProjects(metricKeys).then(projects => this.setState({projects}));
  }

  render() {
    const columns = this.createColumnDefinition();
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
          <ReactTable data={this.state.projects} columns={columns} {...tableProps} />
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

  getProjectStatus(project) {
    if (project.status && project.status.status) {
      return project.status.status;
    } else {
      return 'NONE';
    }    
  }

  renderProjectStatus(status) {
    var icon;
    switch (status) {
      case 'OK':
        return <img style={{maxWidth: '1.1em', verticalAlign: 'middle'}} src={iconGreen}  alt={status} />;
      case 'WARN':
        return <img style={{maxWidth: '1.1em', verticalAlign: 'middle'}} src={iconOrange}  alt={status} />;
      case 'ERROR':
        return <img style={{maxWidth: '1.1em', verticalAlign: 'middle'}} src={iconOrange}  alt={status} />;
      default:
        return <span />;
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

  createColumnDefinition() {
    const columns = [
        {
          id: 'status',
          header: "",
          accessor: project => this.getProjectStatus(project),
          render: ({value}) => this.renderProjectStatus(value)
        },
        {
          header: 'Name', 
          headerStyle: {textAlign: 'left'},
          accessor: 'name',
          style: {textAlign: 'left'},
          render: ({value, row}) => <a href={'http://sonar.chess.int/dashboard?id='+row.id}>{value}</a>
        }
    ];

    metricKeys.forEach(key => columns.push(
      {
        id: key,
        header: this.state.metrics[key] ? this.state.metrics[key].name : "",
        accessor: project => {
          const measure = project.measures.measures.find(m => m.metric === key);
          return measure && measure.value;},
        render: ({value}) => <span>{this.formatMetric(key, value)}</span>
      } ));

    columns.push(
      {
        id: 'date',
        header: 'Last analysis',
        accessor: project => project.analysisDate && new Date(project.analysisDate),
        render: ({value}) => <span>{this.formatDate(value)}</span>,
        sort: 'desc'
      }
    );
    return columns;    
  }

}

export default App;

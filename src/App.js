import React, { Component } from 'react';
import ReactTable from 'react-table';
import Numeral from 'numeral';

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
      }));
  }

  render() {
    const rtColumns = [
        {
          header: 'Name', 
          headerStyle: {textAlign: 'left'},
          accessor: 'name',
          style: {textAlign: 'left'}
        }
    ];

    metricKeys.forEach(c => rtColumns.push(
      {
        id: c,
        header: this.state.metrics[c] ? this.state.metrics[c].name : "",
        accessor: resource => {
          const measure = resource.msr.find(m => m.key === c);
          return measure && measure.val;},
        render: row => <span>{this.formatMetric(c, row.value)}</span>
      } ));

    rtColumns.push(
      {
        id: 'date',
        header: 'Last analysis',
        accessor: resource => new Date(resource.date),
        render: row => <span>{this.formatDate(row.value)}</span>
      }
    );
    
    return (
      <div>
        <div className="pure-g">&nbsp;</div>
        <div className="pure-g">
          <div className="pure-u-1-24"></div>
          <div className="pure-u-22-24">
          <ReactTable tableClassName="pure-table pure-table-horizontal" trClassCallback={row => (row.viewIndex % 2 === 0) ? "pure-table-odd" : "" } data={this.state.resources} columns={rtColumns} minRows={0} showPagination={false} loading={false} pageSize={200} />
          </div>
          <div className="pure-u-1-24"></div>
        </div>
      </div>
    );
  }

  formatMetric(metricKey, value) {
    if (value == undefined) {
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
    } else {
      out += then.toLocaleDateString('nl-NL');
    }
    return out;
  }

}

export default App;

import React, { Component } from 'react';
import ProjectRow from './ProjectRow';
import HeaderRow from './HeaderRow';
import './pure-min-0.6.2.css';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      projects: []
    };
  }

  componentDidMount() {
    fetch('/api/projects/index')
    .then( response => response.json())
    .then(projects => this.setState({projects: projects}));
  }

  render() {
    const metrics = ['ncloc','complexity','violations','blocker_violations','critical_violations','class_complexity','high_severity_vulns','overall_coverage'];
    return (
      <div>
        <div className="pure-g">&nbsp;</div>
        <div className="pure-g">
          <div className="pure-u-1-24"></div>
          <div className="pure-u-22-24">
          <table className="pure-table pure-table-horizontal">
            <HeaderRow metrics={metrics} />
            <tbody>
              {this.state.projects.map((p, i) => {
                  // We're using the odd style for even rows, but it looks better...
                  const cName = (i % 2 === 0) ? "pure-table-odd" : "";
                  return <ProjectRow key={p.id} project={p} metrics={metrics} rowClass={cName} />;
                })}
            </tbody>
          </table>
          </div>
          <div className="pure-u-1-24"></div>
        </div>
      </div>
    );
  }
}

export default App;

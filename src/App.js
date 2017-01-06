import React, { Component } from 'react';
import ProjectRow from './ProjectRow';
import HeaderRow from './HeaderRow';
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
      <div className="App">
        <table style={{border: "1px solid black", marginLeft: "auto", marginRight: "auto"}}>
        <HeaderRow metrics={metrics} />
        <tbody>
          {this.state.projects.map(p => {
              return <ProjectRow key={p.id} project={p} metrics={metrics} />;
            })
          }
          </tbody>
        </table>
      </div>
    );
  }
}

export default App;

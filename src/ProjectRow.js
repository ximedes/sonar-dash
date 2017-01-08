import React, { Component } from 'react';
import Numeral from 'numeral';

class ProjectRow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            metricValues: {}
        };
    }

    componentDidMount() {
      const projectKey = this.props.project.k;

      fetch('/api/measures/component?componentKey=' + projectKey + '&metricKeys=' + this.props.columns.join(','))
        .then(response => response.json())
        .then(json => {
            const metricValues = {};
            json.component.measures.forEach(measure => metricValues[measure.metric] = measure.value);
            this.setState({metricValues});
        });
    }

    render() {
      const project = this.props.project;
      return <tr className={this.props.rowClass}>
                <td title={project.k} style={{textAlign: "left"}}>{project.nm}</td>
                {this.props.columns.map(metricKey => <td key={metricKey}>{this.format(metricKey, this.state.metricValues[metricKey])}</td>)}
            </tr>;
    }

    format(metricKey, value) {
        const type = this.props.metrics[metricKey].type;
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
}

export default ProjectRow;

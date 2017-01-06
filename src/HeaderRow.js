import React, { Component } from 'react';

class HeaderRow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            metrics: {}
        }
    }

    componentDidMount() {
        const newMetrics = {};
        fetch('/api/metrics/search?f=name')
        .then( response => response.json())
        .then(json => {
            json.metrics.forEach(m => {
                if (this.props.metrics.indexOf(m.key) !== -1) {
                    newMetrics[m.key] = m.name;
                }
            });
            this.setState({metrics: newMetrics});
        });
    }

    render() {
     return (
         <thead>
          <tr>
            {this.props.metrics.map(metricKey => <td key={metricKey} style={{textAlign: "right"}}>{this.state.metrics[metricKey]}</td>)}
          </tr>
        </thead>
        );
    }
}

export default HeaderRow;

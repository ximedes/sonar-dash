import React, { Component } from 'react';

class HeaderRow extends Component {

    render() {
     return (
         <thead>
          <tr>
            <th style={{textAlign: "left"}}>Name</th>
            {this.props.columns.map(metricKey => <td key={metricKey}>{this.props.metrics[metricKey] ? this.props.metrics[metricKey].name : ""}</td>)}
          </tr>
        </thead>
        );
    }
}

export default HeaderRow;

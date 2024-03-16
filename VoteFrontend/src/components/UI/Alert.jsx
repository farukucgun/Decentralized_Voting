import React from 'react'
import { useAlert } from '../../AlertContext';

import './Alert.css';

const Alert = () => {

    const { alerts } = useAlert();

    if (alerts === null || alerts.length === 0) {
        return null;
    }

    return ( 
        <div className="alerts">
                {alerts.map((alert) => (
                    <div key={alert.id} className={`alert alert-${alert.type}`}>
                        {alert.msg}
                    </div>    
                ))}
        </div>
    );
}

export default Alert
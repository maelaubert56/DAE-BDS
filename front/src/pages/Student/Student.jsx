
import Button from 'react-bootstrap/Button';
import React, { useEffect, useState } from 'react';

import FormDAE from './Forms/DAE';


export default function Student() {
    const [formId, setformId] = useState('');
    
    useEffect(() => {
        const url = new URL(window.location.href);
        setformId(url.hash.slice(1));
        console.log(formId);

        window.addEventListener('hashchange', () => {
            const url = new URL(window.location.href);
            setformId(url.hash.slice(1));
            console.log(formId);
        });
    }, [formId]);

    return (
        <div>
            {formId === 'DAE' && <FormDAE />}
            {formId !== 'DAE' && <div className="d-flex justify-content-center align-items-center flex-column">
            <div className="d-flex justify-content-center align-items-center flex-column my-5">
                <p>Choisissez un form :</p>
                <div className="d-flex justify-content-between gap-2 flex-wrap">
                <Button href="#DAE" variant='outline-primary'>DAE</Button>
                </div>
                </div>
            </div>
            }
        </div>
    );
}

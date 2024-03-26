
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

    return (<>
        {formId === 'DAE' && 
        <div className="flex-fill w-100 d-flex justify-content-center align-items-center bg-white">
            <FormDAE />
        </div>
        }
        
        {formId !== 'DAE' &&
        <div style={{backgroundImage: 'url(/banniere_bds.png)', backgroundSize: 'cover', backgroundAttachment: 'fixed'}} className="d-flex justify-content-center align-items-center flex-column flex-fill">
            <div className="flex-fill w-100 d-flex justify-content-center align-items-center" style={{backgroundColor: 'rgba(0, 0, 0, 0.2)'}}>
                <div className="d-flex justify-content-center align-items-center flex-column w-100" >
                    <div className="d-flex justify-content-center align-items-center gap-3 flex-column">
                        <h3 className='text-light'>Choisissez un form :</h3>
                        <div className="d-flex justify-content-between gap-2 flex-wrap">
                            <Button size='lg' href="#DAE" variant='outline-light'>DAE</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        }
        </>
    );
}

import {
    ArrowDownIcon,
    ArrowUpIcon,
    SwitchHorizontalIcon
} from '@heroicons/react/solid';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
    Col,
    Container,
    Form,
    InputGroup,
    Row,
    Spinner
} from 'react-bootstrap';
import { clearIntervalAsync } from 'set-interval-async';
import { setIntervalAsync } from 'set-interval-async/fixed';
import usePrevious from '../hooks/usePrevious';
import './BtcUsdConverter.css';

const BtcUsdConverter = () => {
	const [loading, setLoading] = useState(true);
	const [btcUsdRate, setBtcUsdRate] = useState(0);
	const [inputValue, setInputValue] = useState(0);
	const [outputValue, setOutputValue] = useState(0);
	const [arrowIcon, setArrowIcon] = useState<'up' | 'down'>('up');
	const [inputType, setInputType] = useState<'BTC' | 'USD'>('BTC');
	const [errorMsg, setErrorMsg] = useState('');

	const prevAmount = usePrevious(btcUsdRate);

	useEffect(() => {
		const getBtcUsdRate = async () => {
			try {
				const getData = await axios.get(
					`https://api.coinbase.com/v2/prices/spot?currency=USD`
				);
				const rate = Number(getData.data.data.amount);
				if (btcUsdRate !== rate) setBtcUsdRate(rate);
				if (prevAmount < btcUsdRate) {
					setArrowIcon('up');
				} else {
					setArrowIcon('down');
				}
				if (loading) setLoading(false);
			} catch {
				setErrorMsg('Price was not received from server');
				setLoading(false);
			}
		};

		const interval = setIntervalAsync(() => getBtcUsdRate(), 3000);

		return () => {
			clearIntervalAsync(interval);
		}
	}, [btcUsdRate, loading]);

	useEffect(() => {
		if (btcUsdRate) {
			if (inputType === 'BTC') {
				const output = inputValue * btcUsdRate;
				const formatedOutput = Number(
					(Math.round(output * 100) / 100).toFixed(2)
				);
				setOutputValue(formatedOutput);
			}
			if (inputType === 'USD') {
				const output = inputValue / btcUsdRate;
				const formatedOutput = Number(
					(
						Math.round(output * 10000000) / 10000000
					).toFixed(6)
				);
				setOutputValue(formatedOutput);
			}
		}
	}, [inputType, inputValue, btcUsdRate]);

	const Switch = () => {
		switch (inputType) {
			case 'BTC':
				setInputType('USD');
				break;
			case 'USD':
				setInputType('BTC');
				break;
		}
	};

	return (
		<Container>
			<Row className="my-3 ">
				<h3>BTC / USD Calculator</h3>
			</Row>
			<div className=" border rounded p-5">
				<Row className="mb-3 align-items-center">
					<Col>
						<span>Live BTC/USD Rate:</span>
						{loading ? (
							<Spinner
								className="mx-2"
								animation="grow"
								size="sm"
								variant="primary"
							/>
						) : (
							<>
								<span className="mx-2">
									{errorMsg
										? errorMsg
										: btcUsdRate}
								</span>
								{arrowIcon === 'up' ? (
									<ArrowUpIcon className="arrow-icon-green" />
								) : (
									<ArrowDownIcon className="arrow-icon-red" />
								)}
							</>
						)}
					</Col>
				</Row>
				<Row className="mb-3 align-items-center">
					<Col lg={5} md>
						<Col>
							<Form.Label>Quantity:</Form.Label>
						</Col>
						<Col>
							{loading ? (
								<Spinner
									animation="grow"
									size="sm"
									variant="primary"
								/>
							) : (
								<InputGroup>
									<Form.Control
										type="number"
										placeholder={`Enter ${inputType} amount`}
										defaultValue={0}
										onChange={(
											e: React.ChangeEvent<HTMLInputElement>
										) =>
											setInputValue(
												Number(
													e
														.target
														.value
												)
											)
										}
									/>
									<InputGroup.Text>
										{inputType === 'BTC'
											? 'BTC'
											: 'USD'}
									</InputGroup.Text>
								</InputGroup>
							)}
						</Col>
					</Col>
					<Col lg={2} md className="text-center py-3">
						<SwitchHorizontalIcon
							className="switch-icon"
							onClick={Switch}
						/>
					</Col>
					<Col lg={5} md>
						<Col>
							<Form.Label>You receive:</Form.Label>
						</Col>
						<Col>
							<InputGroup>
								<Form.Control
									type="number"
									value={outputValue}
									readOnly
									disabled
								/>
								<InputGroup.Text>
									{inputType === 'BTC'
										? 'USD'
										: 'BTC'}
								</InputGroup.Text>
							</InputGroup>
						</Col>
					</Col>
				</Row>
			</div>
		</Container>
	);
};

export default BtcUsdConverter;

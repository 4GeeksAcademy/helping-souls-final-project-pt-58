import { Link } from "react-router-dom";

export const Footer = () => (
	<footer className="footer mt-auto py-3 text-center">
		<h3 className="card-title">We invite you to visit these organizations and help more souls.</h3>
		<div className="row row-cols-1 row-cols-md-5 g-4 d-flex justify-content-evenly">
			<div className="col">
				<div className="card border-0">
					<Link to="https://www.greenpeace.org/international/">
						<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpLjMKW1BNUjTuw-5jinklXmE8ExI4C2QVzA&s" className="card-img-top rounded-circle mt-3" alt="Greenpeace"
							style={{ width: "120px", height: "120px", objectFit: "cover" }}
						/>
					</Link>
					<div className="card-body">
						<h5 className="card-title">
							<a href="https://www.greenpeace.org/international/" className="text-decoration-none">Greenpeace</a>
						</h5>
					</div>
				</div>
			</div>
			<div className="col">
				<div className="card border-0">
					<Link to="https://www.savethechildren.net/">
						<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSp8Y6f1wDdnycGJHS9RVVq5hfuuRcedS6WHQ&s" className="card-img-top rounded-circle mt-3" alt="Save the Children"
							style={{ width: "120px", height: "120px", objectFit: "cover" }}
						/>
					</Link>
					<div className="card-body">
						<h5 className="card-title">
							<a href="https://www.savethechildren.net/" className="text-decoration-none">Save the Children</a>
						</h5>
					</div>
				</div>
			</div>
			<div className="col">
				<div className="card border-0">
					<Link to="https://www.icrc.org/en">
						<img src="https://www.redcross.org/content/dam/redcross/International-Services/global-network-icrc.png.transform/1288/q82/feature/image.png" className="card-img-top rounded-circle mt-3" alt="Red Cross"
							style={{ width: "120px", height: "120px", objectFit: "cover" }}
						/>
					</Link>
					<div className="card-body">
						<h5 className="card-title">
							<a href="https://www.icrc.org/en" className="text-decoration-none">Red Cross</a>
						</h5>
					</div>
				</div>
			</div>
			<div className="col">
				<div className="card border-0">
					<Link to="https://www.unicef.org/">
						<img src="https://upload.wikimedia.org/wikipedia/commons/f/fb/UNICEF_Logo_%28cropped%29.png" className="card-img-top rounded-circle mt-3" alt="Unicef"
							style={{ width: "120px", height: "120px", objectFit: "cover" }}
						/>
					</Link>
					<div className="card-body">
						<h5 className="card-title">
							<a href="https://www.unicef.org/" className="text-decoration-none">Unicef</a>
						</h5>
					</div>
				</div>
			</div>
			
		</div>

	</footer>
);
